import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 transition-colors duration-300">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-9xl font-extrabold tracking-widest text-primary/80 select-none">
          404
        </h1>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("errors.pageNotFoundTitle")}
          </h2>
          <p className="text-muted-foreground">
            {t("errors.pageNotFoundDescription")}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            {t("common.goBack")}
          </Button>
          
          <Button 
            onClick={() => navigate("/")}
          >
            {t("common.backToHome")}
          </Button>
        </div>
      </div>
    </div>
  );
}