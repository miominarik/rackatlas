import { Form, Head, setLayoutProps } from "@inertiajs/react";
import { useMemo, useState } from "react";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OTP_MAX_LENGTH } from "@/hooks/use-two-factor-auth";
import { store } from "@/routes/two-factor/login";
import { TurnstileField, useTurnstile } from "@/hooks/use-turnstile";
import { useTranslation } from "@/hooks/use-translation";

export default function TwoFactorChallenge() {
    const { t } = useTranslation();
    const turnstile = useTurnstile("two-factor-challenge");
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>("");

    const changeCode = (value: string, form: HTMLFormElement | null): void => {
        const digits = value.replace(/\D/g, "").slice(0, OTP_MAX_LENGTH);
        setCode(digits);

        if (digits.length === OTP_MAX_LENGTH && turnstile.ready) {
            requestAnimationFrame(() => form?.requestSubmit());
        }
    };

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: "Recovery code",
                description:
                    "Please confirm access to your account by entering one of your emergency recovery codes.",
                toggleText: "login using an authentication code",
            };
        }

        return {
            title: "Authentication code",
            description:
                "Enter the authentication code provided by your authenticator application.",
            toggleText: "login using a recovery code",
        };
    }, [showRecoveryInput]);

    setLayoutProps({
        title: authConfigContent.title,
        description: authConfigContent.description,
    });

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode("");
    };

    return (
        <>
            <Head title={t("Two-factor authentication")} />

            <div className="space-y-6">
                <Form
                    {...store.form()}
                    className="space-y-4"
                    resetOnError
                    onFinish={turnstile.reset}
                    resetOnSuccess={!showRecoveryInput}
                >
                    {({ errors, processing, clearErrors }) => (
                        <>
                            {showRecoveryInput ? (
                                <div className="space-y-2">
                                    <Input
                                        name="recovery_code"
                                        type="text"
                                        autoComplete="off"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        spellCheck={false}
                                        autoFocus
                                        className="h-12 text-center font-mono text-base"
                                        placeholder={t("Enter recovery code")}
                                        required
                                    />
                                    <InputError
                                        message={errors.recovery_code}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Input
                                        name="code"
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="one-time-code"
                                        autoFocus
                                        required
                                        maxLength={OTP_MAX_LENGTH * 2}
                                        value={code}
                                        onChange={(event) =>
                                            changeCode(
                                                event.target.value,
                                                event.target.form,
                                            )
                                        }
                                        disabled={processing}
                                        aria-label={t("Authentication code")}
                                        placeholder="000000"
                                        className="h-14 text-center font-mono text-2xl tracking-[0.5em] placeholder:text-muted-foreground/40"
                                    />
                                    <InputError message={errors.code} />
                                </div>
                            )}

                            <TurnstileField
                                turnstile={turnstile}
                                error={errors.turnstile_token}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing || !turnstile.ready}
                            >
                                {t("Continue")}
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                <span>{t("or you can")} </span>
                                <button
                                    type="button"
                                    className="cursor-pointer text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    onClick={() =>
                                        toggleRecoveryMode(clearErrors)
                                    }
                                >
                                    {t(authConfigContent.toggleText)}
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
