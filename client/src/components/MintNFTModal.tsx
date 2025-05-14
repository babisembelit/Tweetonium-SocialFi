import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { fileToBase64 } from "@/lib/utils";
import { queryClient } from "@/lib/queryClient";
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
import { Textarea } from "@/components/ui/textarea";
import SuccessModal from "./SuccessModal";

interface MintNFTModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  image: z.any()
    .refine((file) => file instanceof File, "Image is required")
    .refine(
      (file) => file instanceof File && file.type.startsWith("image/"),
      "File must be an image"
    )
});

type FormValues = z.infer<typeof formSchema>;

export default function MintNFTModal({ open, onOpenChange }: MintNFTModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [mintedNFT, setMintedNFT] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const mintMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/mint", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to mint NFT");
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      setMintedNFT(data);
      queryClient.invalidateQueries({ queryKey: ["/api/my-nfts"] });
      onOpenChange(false);
      setShowSuccess(true);
    },
    onError: (error) => {
      toast({
        title: "Minting failed",
        description: error.message || "Failed to mint NFT. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("image", file, { shouldValidate: true });
      
      try {
        const preview = await fileToBase64(file);
        setImagePreview(preview);
      } catch (error) {
        console.error("Error creating preview:", error);
      }
    }
  };

  async function onSubmit(data: FormValues) {
    if (!selectedFile) {
      toast({
        title: "Image required",
        description: "Please select an image to mint your NFT",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    formData.append("image", selectedFile);

    mintMutation.mutate(formData);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90%] max-w-md mx-auto bg-secondary border border-gray-800 text-white p-4 sm:p-6">
          <DialogClose className="absolute right-3 top-3 text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </DialogClose>
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-medium mb-2">Mint Your NFT</DialogTitle>
            <DialogDescription className="text-gray-300 text-sm sm:text-base">
              Upload your artwork and mint it as an NFT on Solana
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">NFT Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My Awesome Artwork"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your artwork..."
                        className="bg-black border-gray-800 text-white text-sm"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-sm">Upload Artwork</FormLabel>
                    <div 
                      className="border-2 border-dashed border-gray-700 rounded-lg p-3 sm:p-4 text-center cursor-pointer"
                      onClick={() => document.getElementById("nft-image")?.click()}
                    >
                      {imagePreview ? (
                        <div className="relative w-full aspect-square max-h-36 sm:max-h-48 mx-auto">
                          <img 
                            src={imagePreview} 
                            alt="NFT Preview" 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-gray-400" />
                          <p className="text-xs sm:text-sm text-gray-400">Click to upload your image</p>
                        </>
                      )}
                      <input 
                        type="file" 
                        id="nft-image" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </div>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full bg-accent hover:bg-opacity-90 text-white mt-2"
                disabled={mintMutation.isPending}
              >
                <span className="text-sm">{mintMutation.isPending ? "Minting..." : "Mint NFT"}</span>
              </Button>
            </form>
          </Form>

          <p className="text-xs text-gray-400 text-center mt-4">
            This will simulate posting to X with the @tweetonium_xyz tag
            <br />and mint your NFT on Solana Devnet
          </p>
        </DialogContent>
      </Dialog>

      <SuccessModal 
        open={showSuccess} 
        onOpenChange={setShowSuccess} 
        nft={mintedNFT} 
      />
    </>
  );
}
