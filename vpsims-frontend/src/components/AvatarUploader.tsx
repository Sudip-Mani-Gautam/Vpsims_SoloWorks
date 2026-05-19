import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface AvatarUploaderProps {
  initials: string;
  size?: "sm" | "md" | "lg" | "xl";
  ringClass?: string;
}

const AvatarUploader = ({ initials, size = "xl", ringClass }: AvatarUploaderProps) => {
  const { user, updateAvatar } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "w-10 h-10 text-lg",
    md: "w-16 h-16 text-2xl",
    lg: "w-24 h-24 text-3xl",
    xl: "w-32 h-32 text-4xl",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    simulateUpload(file);
  };

  const simulateUpload = (file: File) => {
    setIsUploading(true);
    // Simulate network delay for premium feel
    setTimeout(() => {
      const objectUrl = URL.createObjectURL(file);
      updateAvatar(objectUrl);
      setIsUploading(false);
      toast.success("Profile image updated successfully!");
    }, 1500);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateAvatar(""); // Clear avatar
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Profile image removed");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className={cn(
          "relative rounded-full overflow-hidden flex items-center justify-center font-bold shadow-lg transition-all border-4 bg-muted text-muted-foreground border-background cursor-pointer group",
          sizeClasses[size],
          ringClass && `ring-4 ring-background ${ringClass}`
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-black tracking-tighter">
            {initials}
          </div>
        )}

        {/* Hover / Uploading Overlays */}
        <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white transition-opacity duration-300 ${isUploading || isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6 mb-1 drop-shadow-md" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
            </>
          )}
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/png, image/jpeg, image/webp" 
        className="hidden" 
      />

      {user?.avatarUrl && !isUploading && (
        <button 
          onClick={handleRemove}
          className="text-xs text-destructive hover:text-destructive/80 font-bold flex items-center gap-1 transition-colors"
        >
          <X className="w-3 h-3" /> Remove Image
        </button>
      )}
    </div>
  );
};

export default AvatarUploader;
