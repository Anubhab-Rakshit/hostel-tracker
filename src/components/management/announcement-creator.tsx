"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Megaphone, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const announcementSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    type: z.enum(["info", "warning", "emergency"]),
    priority: z.enum(["low", "medium", "high", "urgent"]),
});

type AnnouncementForm = z.infer<typeof announcementSchema>;

export function AnnouncementCreator({ onCreated }: { onCreated?: () => void }) {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AnnouncementForm>({
        resolver: zodResolver(announcementSchema),
        defaultValues: {
            type: "info",
            priority: "medium",
        },
    });

    const selectedType = watch("type");

    const onSubmit = async (data: AnnouncementForm) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to post announcement");

            toast.success("Announcement broadcasted successfully");
            reset();
            onCreated?.();
        } catch (error) {
            toast.error("Failed to post announcement");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-indigo-500/20 bg-indigo-500/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-400">
                    <Megaphone className="h-5 w-5" />
                    Broadcast Announcement
                </CardTitle>
                <CardDescription>
                    Send notifications to all students and staff.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            {...register("title")}
                            placeholder="Announcement Title"
                            className="bg-black/20 border-white/10"
                        />
                        {errors.title && (
                            <p className="text-xs text-red-400">{errors.title.message}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            onValueChange={(val) => setValue("type", val as any)}
                            defaultValue="info"
                        >
                            <SelectTrigger className="bg-black/20 border-white/10">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="info">Information</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            onValueChange={(val) => setValue("priority", val as any)}
                            defaultValue="medium"
                        >
                            <SelectTrigger className="bg-black/20 border-white/10">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Textarea
                            {...register("content")}
                            placeholder="Message content..."
                            className="bg-black/20 border-white/10 min-h-[100px]"
                        />
                        {errors.content && (
                            <p className="text-xs text-red-400">{errors.content.message}</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="justify-between">
                    <div className="text-xs text-muted-foreground">
                        Visible to: <Badge variant="outline" className="ml-1">All Residents</Badge>
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Send className="h-4 w-4 mr-2" />
                        )}
                        Broadcast
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
