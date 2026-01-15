import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

const PageHeader = ({ title, description, icon: Icon }: PageHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
        {Icon && <Icon className="w-7 h-7 text-accent" />}
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
};

export default PageHeader;
