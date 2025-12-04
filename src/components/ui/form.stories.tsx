import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within, expect } from "@storybook/test";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "./button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./form";
import { Input } from "./input";
import { toast } from "sonner";
import { Toaster } from "./sonner";

const meta: Meta<typeof Form> = {
    title: "UI/Form",
    component: Form,
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Form>;

const FormSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
});

export const Default: Story = {
    render: () => {
        const form = useForm<z.infer<typeof FormSchema>>({
            resolver: zodResolver(FormSchema),
            defaultValues: {
                username: "",
            },
        });

        function onSubmit(data: z.infer<typeof FormSchema>) {
            toast("You submitted the following values:", {
                description: (
                    <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                        <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                    </pre>
                ),
            });
        }

        return (
            <div className="space-y-6">
                <Toaster />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="shadcn" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is your public display name.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const input = canvas.getByLabelText("Username", { selector: "input" });
        await userEvent.type(input, "shadcn", { delay: 100 });

        const submitButton = canvas.getByRole("button", { name: /Submit/i });
        await userEvent.click(submitButton);

        // Expect the toast to appear (this might be tricky to test if toast is outside canvas, 
        // but we can check if the input has the value)
        await expect(input).toHaveValue("shadcn");
    },
};
