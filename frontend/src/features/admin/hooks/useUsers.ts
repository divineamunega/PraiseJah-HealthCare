import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/users.api";
import { type UserStatus, type UserRole, type User } from "@/types/user";
import { toast } from "sonner";

export const useUsers = () => {
  const queryClient = useQueryClient();

  // Queries
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.getAll(),
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (data: {
      firstName: string;
      lastName: string;
      email: string;
      role: UserRole;
    }) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User provisioned successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to provision user");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      usersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User status updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user status");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User details updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,

    createUser: createUserMutation.mutateAsync,
    isCreating: createUserMutation.isPending,

    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,

    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteUser: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
