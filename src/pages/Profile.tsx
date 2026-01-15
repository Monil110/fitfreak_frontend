import { useState, useEffect, useRef } from "react";
import {
  User,
  Phone,
  Calendar,
  Ruler,
  Weight,
  Mail,
  Users,
  ChevronDown,
  Camera,
  RotateCcw,
  Loader2,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import LoadingSpinner from "@/components/LoadingSpinner";
import api from "@/lib/api";

const COUNTRY_CODES = [
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+7", country: "RU", flag: "🇷🇺" },
];

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+1",
    phone: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");

        setForm({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          email: res.data.email || "",
          countryCode: res.data.countryCode || "+1",
          phone: res.data.phone || "",
          gender: res.data.gender || "",
          age: res.data.age?.toString() || "",
          height: res.data.height?.toString() || "",
          weight: res.data.weight?.toString() || "",
        });

        setProfileImage(res.data.imageUrl || null);
      } catch (err) {
        console.error(err);
        alert("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put("/profile", {
        firstName: form.firstName,
        lastName: form.lastName,
        countryCode: form.countryCode,
        phone: form.phone,
        gender: form.gender,
        age: form.age ? +form.age : null,
        height: form.height ? +form.height : null,
        weight: form.weight ? +form.weight : null,
      });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

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

  const bmi =
    form.height && form.weight
      ? (
          parseFloat(form.weight) /
          (parseFloat(form.height) / 100) ** 2
        ).toFixed(1)
      : null;

  const getBmiStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-yellow-600" };
    if (bmi < 25) return { label: "Normal", color: "text-success" };
    if (bmi < 30) return { label: "Overweight", color: "text-yellow-600" };
    return { label: "Obese", color: "text-destructive" };
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
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="bg-primary p-6">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="w-20 h-20 bg-primary-foreground/10 backdrop-blur rounded-full flex items-center justify-center border-2 border-primary-foreground/20 overflow-hidden">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
                    ) : profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-primary-foreground" />
                    )}
                  </div>
                  {!uploading && (
                    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-8 h-8 bg-accent rounded-full flex items-center justify-center hover:bg-accent/90 transition-colors"
                        title="Upload photo"
                        disabled={uploading}
                      >
                        <Camera className="w-4 h-4 text-accent-foreground" />
                      </button>
                      {profileImage && (
                        <button
                          type="button"
                          onClick={handleResetImage}
                          className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary/90 transition-colors"
                          title="Reset to default"
                          disabled={uploading}
                        >
                          <RotateCcw className="w-4 h-4 text-foreground" />
                        </button>
                      )}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary-foreground">
                    {form.firstName || form.lastName
                      ? `${form.firstName} ${form.lastName}`.trim()
                      : "Your Name"}
                  </h2>
                  <p className="text-primary-foreground/70">
                    {form.email || "No email"}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="First Name"
                    type="text"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                    required
                  />
                  <InputField
                    label="Last Name"
                    type="text"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="mt-4">
                  <InputField
                    label="Email"
                    icon={<Mail className="w-4 h-4" />}
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    disabled
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Phone
                  </label>
                  <div className="flex gap-2">
                    <div className="relative">
                      <select
                        value={form.countryCode}
                        onChange={(e) =>
                          setForm({ ...form, countryCode: e.target.value })
                        }
                        className="appearance-none w-24 pr-8 py-2.5 pl-3 bg-secondary border-0 rounded-lg text-sm text-foreground focus:ring-2 focus:ring-ring outline-none transition-all cursor-pointer"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        className="w-full pl-10 pr-3 py-2.5 bg-secondary border-0 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none transition-all"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Gender
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "other", label: "Other" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg cursor-pointer transition-all ${
                          form.gender === option.value
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-foreground hover:bg-secondary/80"
                        }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={option.value}
                          checked={form.gender === option.value}
                          onChange={(e) =>
                            setForm({ ...form, gender: e.target.value })
                          }
                          className="sr-only"
                        />
                        <Users className="w-4 h-4" />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-border" />

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  Fitness Details
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <InputField
                    label="Age"
                    icon={<Calendar className="w-4 h-4" />}
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    min="1"
                    max="120"
                  />
                  <InputField
                    label="Height (cm)"
                    icon={<Ruler className="w-4 h-4" />}
                    type="number"
                    value={form.height}
                    onChange={(e) =>
                      setForm({ ...form, height: e.target.value })
                    }
                    min="1"
                    max="300"
                  />
                  <InputField
                    label="Weight (kg)"
                    icon={<Weight className="w-4 h-4" />}
                    type="number"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                    min="1"
                    max="500"
                  />
                </div>
              </div>

              {bmi && (
                <div className="bg-secondary rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 cursor-pointer">
                  <p className="text-sm text-muted-foreground mb-1">Your BMI</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">
                      {bmi}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        getBmiStatus(parseFloat(bmi)).color
                      }`}
                    >
                      {getBmiStatus(parseFloat(bmi)).label}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update Profile"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

const InputField = ({
  label,
  icon,
  ...props
}: {
  label: string;
  icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={`w-full pr-3 py-2.5 bg-secondary border-0 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          icon ? "pl-10" : "pl-3"
        }`}
      />
    </div>
  </div>
);

export default Profile;