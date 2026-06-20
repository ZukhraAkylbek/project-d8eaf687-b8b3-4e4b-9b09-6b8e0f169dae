import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const AppealInput = z.object({
  lessonId: z.string().min(1),
  taskType: z.string().min(1),
  attemptNumber: z.number().int().min(1).max(99),
  studentInput: z.string().max(8000).optional().default(""),
  systemFeedback: z.string().max(8000).optional().default(""),
  callTranscript: z
    .array(z.object({ role: z.string(), text: z.string() }))
    .max(80)
    .optional()
    .default([]),
  complaintCategory: z.string().min(1).max(200),
  complaintText: z.string().trim().min(3).max(2000),
});

export const submitAppeal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AppealInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("appeals").insert({
      user_id: context.userId,
      lesson_id: data.lessonId,
      task_type: data.taskType,
      attempt_number: data.attemptNumber,
      student_input: data.studentInput || null,
      system_feedback: data.systemFeedback || null,
      call_transcript: data.callTranscript.length ? data.callTranscript : null,
      complaint_category: data.complaintCategory,
      complaint_text: data.complaintText,
    });
    if (error) throw error;
    return { ok: true };
  });
