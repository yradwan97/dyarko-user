import { axiosClient } from "@/lib/services";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

// Subscribe to Newsletter
export function useSubscribeToNewsletter() {

    const t = useTranslations("HomePage.Newsletter");
    return useMutation({
        mutationFn: async (email: string) => {
            const response = await axiosClient.post("/subscription", { email });
            return response.data;
        },
        onSuccess: () => {
            toast.success(t("success"));
        },
        onError: () => {
            toast.error(t("error"));
        },
    });
}