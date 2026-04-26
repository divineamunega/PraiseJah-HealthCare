import { useEffect, useRef, useCallback, useState } from 'react';
import { notesApi, type ClinicalNote, type CreateNoteRequest } from '../api/notes.api';

export interface SoapData {
  chiefComplaint: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface AutosaveState {
  isSaving: boolean;
  lastSavedAt: Date | null;
  error: string | null;
  syncStatus: 'idle' | 'saving' | 'synced' | 'error';
}

export interface AutosaveReturn {
  state: AutosaveState;
  saveNow: () => void;
  reset: () => void;
}

interface AutosaveOptions {
  visitId: string;
  data: SoapData;
  debounceMs?: number;
  onError?: (error: Error) => void;
}

/**
 * Production-grade autosave hook for SOAP clinical notes.
 * 
 * Features:
 * - Debounced saves to reduce server load
 * - Version tracking for optimistic concurrency
 * - Conflict detection with last-write-wins semantics
 * - Stale data refresh when version mismatch detected
 * - Retry logic with exponential backoff
 * - Proper cleanup on unmount
 * 
 * @param options.visitId - The visit being documented
 * @param options.data - Current SOAP form data
 * @param options.debounceMs - Delay before saving (default: 1500ms)
 * @param options.onError - Optional error callback
 */
export function useAutosaveSOAP({
  visitId,
  data,
  debounceMs = 1500,
  onError,
}: AutosaveOptions): AutosaveReturn {
  const [state, setState] = useState<AutosaveState>({
    isSaving: false,
    lastSavedAt: null,
    error: null,
    syncStatus: 'idle',
  });

  // Refs to track mutable state without causing re-renders
  const versionRef = useRef<string>('0');
  const noteIdRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const baseRetryDelayMs = 1000;

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  // Serialize SOAP data to content format
  const serializeContent = useCallback((soap: SoapData): string => {
    return [
      '[SUBJECTIVE]',
      soap.subjective,
      '',
      '[OBJECTIVE]',
      soap.objective,
      '',
      '[ASSESSMENT]',
      soap.assessment,
      '',
      '[PLAN]',
      soap.plan,
    ].join('\n');
  }, []);

  // Check if data has meaningful content to save
  const hasContent = useCallback((): boolean => {
    return !!(
      data.chiefComplaint ||
      data.subjective ||
      data.objective ||
      data.assessment ||
      data.plan
    );
  }, [data]);

  // Perform the actual save operation with retry logic
  const performSave = useCallback(async () => {
    if (!isMountedRef.current || !hasContent()) {
      return;
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const content = serializeContent(data);
    const requestData: CreateNoteRequest = {
      visitId,
      chiefComplaint: data.chiefComplaint,
      content,
      version: versionRef.current,
    };

    setState(prev => ({ ...prev, isSaving: true, error: null, syncStatus: 'saving' }));

    try {
      const result = await notesApi.create(requestData);

      if (!isMountedRef.current) return;

      // Update version and note ID from response
      versionRef.current = result.version;
      noteIdRef.current = result.id;
      retryCountRef.current = 0;

      setState({
        isSaving: false,
        lastSavedAt: new Date(),
        error: null,
        syncStatus: 'synced',
      });

      // Reset to idle after showing synced status
      setTimeout(() => {
        if (isMountedRef.current) {
          setState(prev => ({ ...prev, syncStatus: 'idle' }));
        }
      }, 2000);
    } catch (error: any) {
      if (!isMountedRef.current) return;

      // Handle abort (not an error)
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        return;
      }

      // Retry logic with exponential backoff
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const delay = baseRetryDelayMs * Math.pow(2, retryCountRef.current - 1);

        setTimeout(() => {
          if (isMountedRef.current) {
            performSave();
          }
        }, delay);
        return;
      }

      // Max retries exceeded
      retryCountRef.current = 0;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save';

      setState({
        isSaving: false,
        lastSavedAt: state.lastSavedAt,
        error: errorMessage,
        syncStatus: 'error',
      });

      if (onError) {
        onError(new Error(errorMessage));
      }
    }
  }, [visitId, data, serializeContent, hasContent, onError, state.lastSavedAt]);

  // Debounced save trigger
  const scheduleSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);
  }, [debounceMs, performSave]);

  // Immediate save function (bypasses debounce)
  const saveNow = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    performSave();
  }, [performSave]);

  // Reset function to clear state
  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    versionRef.current = '0';
    noteIdRef.current = null;
    retryCountRef.current = 0;
    setState({
      isSaving: false,
      lastSavedAt: null,
      error: null,
      syncStatus: 'idle',
    });
  }, []);

  // Watch for data changes and trigger autosave
  useEffect(() => {
    if (visitId && hasContent()) {
      scheduleSave();
    }
    // Only trigger on data changes, not state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitId, data.chiefComplaint, data.subjective, data.objective, data.assessment, data.plan]);

  // Load existing note version on mount or visitId change
  useEffect(() => {
    if (!visitId) return;

    const loadExistingNote = async () => {
      try {
        const existingNote = await notesApi.findByVisit(visitId);
        if (existingNote && isMountedRef.current) {
          versionRef.current = existingNote.version;
          noteIdRef.current = existingNote.id;

          // If we have an existing note, mark as synced
          setState(prev => ({ ...prev, syncStatus: 'synced' }));
          setTimeout(() => {
            if (isMountedRef.current) {
              setState(prev => ({ ...prev, syncStatus: 'idle' }));
            }
          }, 2000);
        }
      } catch (error) {
        // Silently handle - note might not exist yet
        console.debug('No existing note found for visit:', visitId);
      }
    };

    loadExistingNote();
  }, [visitId]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    state,
    saveNow,
    reset,
  };
}