import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface ProfileData {
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  gender: string;
  age: number | string;
  height: number | string;
  weight: number | string;
  bio: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ProfileData;
  onSave: (data: ProfileData) => void;
}

const EditProfileDialog = ({
  open,
  onOpenChange,
  formData,
  onSave,
}: Props) => {
  const [data, setData] = useState<ProfileData>(formData);

  useEffect(() => {
    setData(formData);
  }, [formData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>First Name</Label>
              <Input
                value={data.firstName}
                onChange={(e) => setData({ ...data, firstName: e.target.value })}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={data.lastName}
                onChange={(e) => setData({ ...data, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                value={data.age}
                onChange={(e) => setData({ ...data, age: e.target.value })}
              />
            </div>
            <div>
              <Label>Height (cm)</Label>
              <Input
                type="number"
                value={data.height}
                onChange={(e) => setData({ ...data, height: e.target.value })}
              />
            </div>
            <div>
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                value={data.weight}
                onChange={(e) => setData({ ...data, weight: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea
              rows={3}
              value={data.bio}
              onChange={(e) => setData({ ...data, bio: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onSave(data);
                onOpenChange(false);
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
