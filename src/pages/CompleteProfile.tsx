import { useRef, useState } from "react";
import EditProfileDialog from "@/components/EditProfileDialog";
import api from "@/lib/api";

const CompleteProfile = () => {
  const [open, setOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (data: any) => {
    await api.put("/profile", {
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
      height: data.height,
      weight: data.weight,
      bio: data.bio,
      phone: data.phone,
      gender: data.gender,
      countryCode: data.countryCode,
    });

    window.location.href = "/dashboard";
  };

  return (
    <EditProfileDialog
      open={open}
      onOpenChange={() => {}}
      formData={{
        firstName: "",
        lastName: "",
        age: "",
        height: "",
        weight: "",
        bio: "",
        phone: "",
        gender: "",
        countryCode: "+1",
      }}
      onSave={handleSave}
      profileImage={null}
      onImageUpload={() => {}}
      onResetImage={() => {}}
      fileInputRef={fileInputRef}
    />
  );
};

export default CompleteProfile;
