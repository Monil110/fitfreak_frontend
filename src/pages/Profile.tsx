import { useState, useEffect, useRef } from "react";
import { User, Settings, Camera, RotateCcw, Loader2 } from "lucide-react";
import NavBar from "@/components/NavBar";
import LoadingSpinner from "@/components/LoadingSpinner";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import EditProfileDialog from "@/components/EditProfileDialog";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  gender: string;
  age: number | string;
  height: number | string;
  weight: number | string;
  bio: string;
  imageUrl?: string;
}

interface SocialStats {
  posts: number;
  followers: number;
  following: number;
}

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+1",
    phone: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
    bio: "",
  });

  const [socialStats, setSocialStats] = useState<SocialStats>({
    posts: 0,
    followers: 0,
    following: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        setProfileData({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          email: res.data.email || "",
          countryCode: res.data.countryCode || "+1",
          phone: res.data.phone || "",
          gender: res.data.gender || "",
          age: res.data.age || "",
          height: res.data.height || "",
          weight: res.data.weight || "",
          bio: res.data.bio || "",
        });
        setProfileImage(res.data.imageUrl || null);
        
        if (res.data.socialStats) {
          setSocialStats(res.data.socialStats);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        alert("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await api.post("/profile/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfileImage(res.data.imageUrl);
      alert("Profile image updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleResetImage = async () => {
    if (!confirm("Are you sure you want to remove your profile image?")) {
      return;
    }

    try {
      setUploading(true);
      await api.delete("/profile/upload-image");
      setProfileImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      alert("Profile image removed successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to remove image");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (data: ProfileData) => {
    try {
      await api.put("/profile", {
        firstName: data.firstName,
        lastName: data.lastName,
        countryCode: data.countryCode,
        phone: data.phone,
        gender: data.gender,
        age: data.age ? +data.age : null,
        height: data.height ? +data.height : null,
        weight: data.weight ? +data.weight : null,
        bio: data.bio,
      });
      setProfileData(data);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gradient-to-bl from-accent/20 via-accent/5 to-background relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 animate-float-slow" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-float-slow-reverse" />
          </div>
          <LoadingSpinner message="Loading profile..." />
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-bl from-accent/20 via-accent/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 animate-float-slow" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/15 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-float-slow-reverse" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header Card */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Header Background */}
            <div className="h-24 bg-gradient-to-r from-accent/30 via-accent/20 to-primary/20" />

            {/* Profile Info Section */}
            <div className="px-6 pb-6">
              {/* Avatar & Actions Row */}
              <div className="flex items-end justify-between -mt-12 mb-4">
                {/* Profile Picture with Upload/Reset Options */}
                <div className="relative group">
                  <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center border-4 border-card overflow-hidden shadow-lg">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                    ) : profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <User className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Upload/Reset Controls - Show on Hover */}
                  {!uploading && (
                    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-8 h-8 bg-accent rounded-full flex items-center justify-center hover:bg-accent/90 transition-colors shadow-lg"
                        title="Upload photo"
                      >
                        <Camera className="w-4 h-4 text-accent-foreground" />
                      </button>
                      {profileImage && (
                        <button
                          type="button"
                          onClick={handleResetImage}
                          className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary/90 transition-colors shadow-lg"
                          title="Reset to default"
                        >
                          <RotateCcw className="w-4 h-4 text-foreground" />
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>

                {/* Edit Profile Button */}
                <div className="flex gap-2 mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditDialogOpen(true)}
                    className="gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>

              {/* Name & Username */}
              <div className="mb-4">
                <h1 className="text-xl font-bold text-foreground">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <p className="text-muted-foreground text-sm">
                  @{profileData.firstName.toLowerCase()}{profileData.lastName.toLowerCase()}
                </p>
              </div>

              {/* Bio */}
              {profileData.bio && (
                <p className="text-foreground text-sm mb-4 whitespace-pre-line">
                  {profileData.bio}
                </p>
              )}

              {/* Stats Row */}
              <div className="flex gap-6 py-4 border-t border-b border-border">
                <StatItem value={socialStats.followers} label="Followers" formatted={formatNumber(socialStats.followers)} />
                <StatItem value={socialStats.following} label="Following" formatted={formatNumber(socialStats.following)} />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                {profileData.age && (
                  <QuickStat label="Age" value={`${profileData.age} yrs`} />
                )}
                {profileData.height && (
                  <QuickStat label="Height" value={`${profileData.height} cm`} />
                )}
                {profileData.weight && (
                  <QuickStat label="Weight" value={`${profileData.weight} kg`} />
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <ActivityHeatmap weeks={20} />
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        formData={profileData}
        onSave={handleSaveProfile}
      />
    </>
  );
};

const StatItem = ({ 
  value, 
  label, 
  formatted 
}: { 
  value: number; 
  label: string; 
  formatted?: string;
}) => (
  <button className="text-center hover:opacity-70 transition-opacity">
    <p className="text-lg font-bold text-foreground">{formatted || value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </button>
);

const QuickStat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-secondary rounded-lg p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 cursor-pointer">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="text-sm font-semibold text-foreground">{value}</p>
  </div>
);

export default Profile;