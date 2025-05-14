import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/hooks/useAuthStore";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ConnectXModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ConnectXModal({ open, onOpenChange }: ConnectXModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuthStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/connect", data);
      return res.json();
    },
    onSuccess: (data) => {
      login(
        { id: data.user.id, username: data.user.username },
        { publicKey: data.wallet.publicKey }
      );
      toast({
        title: "Successfully connected!",
        description: "Your X account has been connected and a Solana wallet has been created for you.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect X account. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  function onSubmit(data: FormValues) {
    setLoading(true);
    connectMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-md mx-auto bg-secondary border border-gray-800 text-white p-4 sm:p-6">
        <DialogClose className="absolute right-3 top-3 text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-medium mb-2">Connect to X (Twitter)</DialogTitle>
          <DialogDescription className="text-gray-300 text-sm sm:text-base">
            Connect your X account to mint NFTs and showcase your digital artwork.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="@username"
                      className="bg-black border-gray-800 text-white text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-black border-gray-800 text-white text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-sm" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-[#1DA1F2] hover:bg-opacity-90 text-white mt-2"
              disabled={loading}
            >
              <span className="text-sm">{loading ? "Connecting..." : "Log in with X"}</span>
            </Button>
          </form>
        </Form>

        <p className="text-xs text-gray-400 text-center mt-4">
          This is a simulated login for demonstration purposes.
          <br />No actual X credentials will be stored.
        </p>
      </DialogContent>
    </Dialog>
  );
}
