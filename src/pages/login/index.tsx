import React, { useState } from "react";
import BankImage from "@/assets/bank-img.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { useThemeStore } from "@/app/store/themeStore";
import { useTranslation } from "react-i18next";
import { Sun, Moon, Globe } from "lucide-react";
import { toast } from "sonner";

type AuthView = "login" | "register" | "reset-password";

function LeftPanel() {
  return (
    <div className="w-[55%] hidden md:block overflow-hidden min-w-0 bg-muted">
      <img src={BankImage} alt="Bank Logo" className="w-full h-full object-cover opacity-90 dark:opacity-80" />
    </div>
  );
}

function Header() {
  const { theme, toggleTheme } = useThemeStore();
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("tbbank-lang", lang);
  };

  return (
    <div className="flex justify-between items-center px-6 py-3 border-b border-border text-[13px] bg-background">
      <span className="font-semibold text-foreground">"TÜRKMENBAŞY" PTB ©</span>
      <div className="flex items-center gap-4 text-muted-foreground">
        <span className="hidden sm:inline">(+99312) 44-42-34</span>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md hover:bg-accent text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className="flex items-center gap-1.5 bg-accent/50 px-2 py-1 rounded-md">
          <Globe size={14} className="text-foreground" />
          <div className="flex gap-1 items-center ml-1">
            {["tk", "ru", "en"].map((lang, idx) => (
              <React.Fragment key={lang}>
                <span
                  onClick={() => changeLanguage(lang)}
                  className={`cursor-pointer uppercase font-medium transition-colors hover:text-foreground ${
                    i18n.language === lang ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {lang}
                </span>
                {idx < 2 && <span className="text-border">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormInputProps extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

function FormInput({
  label,
  value,
  onChange,
  ...props
}: FormInputProps) {
  return (
    <div className="mb-4">
      <label className="block text-[13px] font-medium text-foreground mb-1.5">
        {label}
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background border-input focus-visible:ring-primary"
        {...props}
      />
    </div>
  );
}

export default function AuthPage() {
  const { t } = useTranslation();
  const loginMutation = useLogin();
  const [view, setView] = useState<AuthView>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      toast.error(t("Write a correct data please", "Please enter valid data"));
      return;
    }
    
    loginMutation.mutate({ email: username, password }, {
      onError: () => {
        toast.error(t("Server Error", "An error occurred during login"));
      }
    });
  };

  // Mock submit for other views
  const handleOtherSubmit = async () => {
    toast.info(t("Not Implemented", "This feature is not implemented yet"));
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      <Header />
      <div className="flex flex-1 w-full overflow-hidden">
        <LeftPanel />

        <div className="w-full md:w-[45%] flex flex-col bg-background">
          <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10 overflow-y-auto">
            {view === "login" && (
              <>
                <h2 className="text-[22px] font-normal text-foreground text-center mb-2 tracking-wide uppercase">
                  {t("Online panel", "ONLAÝN KABULHANA")}
                </h2>
                <div className="w-14 h-0.5 bg-primary mx-auto mb-7" />

                <FormInput
                  label={t("Phone or username", "Telefon ýada ulanyjy ady")}
                  value={username}
                  onChange={setUsername}
                  placeholder="65999990 ýada ulanyjy_ady"
                />
                <FormInput
                  label={t("Password")}
                  type="password"
                  value={password}
                  onChange={setPassword}
                />

                <div className="text-right mb-6 -mt-2">
                  <span
                    onClick={() => setView("reset-password")}
                    className="text-[13px] text-primary cursor-pointer hover:underline"
                  >
                    {t("Forgot your password?")}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <Button onClick={handleLogin} disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? t("Loading") + "..." : t("Login")}
                  </Button>
                  <Button variant="outline" onClick={() => setView("register")}>
                    {t("Register")}
                  </Button>
                </div>

                <div className="text-center mt-8">
                  <span className="text-[13px] text-muted-foreground underline cursor-pointer hover:text-foreground transition-colors">
                    Privacy Policy
                  </span>
                </div>
              </>
            )}

            {view === "register" && (
              <>
                <h2 className="text-xl font-normal text-foreground text-center mb-2">
                  {t("Online panel", "Onlaýn kabulhana")}
                </h2>
                <div className="w-14 h-0.5 bg-primary mx-auto mb-7" />

                <FormInput
                  label={t("Full Name")}
                  value={fullName}
                  onChange={setFullName}
                />
                <FormInput label={t("Phone")} value={phone} onChange={setPhone} />
                <FormInput
                  label={t("Username")}
                  value={username}
                  onChange={setUsername}
                />
                <FormInput
                  label={t("Password")}
                  type="password"
                  value={password}
                  onChange={setPassword}
                />
                <FormInput
                  label={t("Confirm Password")}
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />

                <div className="flex flex-col gap-3 mt-4">
                  <Button onClick={handleOtherSubmit}>
                    {t("Register")}
                  </Button>
                  <Button variant="outline" onClick={() => setView("login")}>
                    {t("Go to login page")}
                  </Button>
                </div>

                <div className="text-center mt-8">
                  <span className="text-[13px] text-muted-foreground underline cursor-pointer hover:text-foreground transition-colors">
                    Privacy Policy
                  </span>
                </div>
              </>
            )}

            {view === "reset-password" && (
              <>
                <h2 className="text-lg font-normal text-foreground text-center mb-2 leading-relaxed">
                  {t("Enter your username to continue")}
                </h2>
                <div className="w-14 h-0.5 bg-primary mx-auto mb-7" />

                <FormInput
                  label={t("Username")}
                  value={username}
                  onChange={setUsername}
                />

                <div className="mt-4 flex flex-col gap-3">
                  <Button onClick={handleOtherSubmit}>
                    {t("Submit")}
                  </Button>
                  <Button variant="outline" onClick={() => setView("login")}>
                    {t("Go to login page")}
                  </Button>
                </div>

                <div className="text-center mt-8">
                  <span className="text-[13px] text-muted-foreground underline cursor-pointer hover:text-foreground transition-colors">
                    Privacy Policy
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
