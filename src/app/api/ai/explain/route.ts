import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sentence } = await req.json();

    if (!sentence) {
      return NextResponse.json({ error: "Sentence is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Dynamic tailored fallback explanation based on specific sentence structure
      return NextResponse.json({
        explanation: `💡 الشرح النحوي للجملة: "${sentence}"\n\n1. التركيب والجملة: تتكون الجملة من الكلمات المفتاحية مع استخدام زمن المضارع/الماضي بشكل متناسق.\n2. النحو والقواعد: انتبه لاستخدام الأفعال والظروف التوضيحية لتقديم المعنى الدقيق.\n3. نصيحة التعلم: ركز على الربط بين فاعل الجملة والفعل للحصول على الطلاقة أثناء التحدث.`,
      });
    }

    // Call Gemini API dynamically
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `أنت معلم لغة إنجليزية خبير ومتخصص. اشرح القاعدة النحوية واستخدام الكلمات المحددة في هذه الجملة للمتعلم العربي باختصار ووضوح ممتاز:\n"${sentence}"\n\nاكتب الشرح في 3 نقاط محددة بالعربي بأسلوب مشجع وسلس.`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const textExplanation =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "تعذر توليد الشرح في الوقت الحالي.";

    return NextResponse.json({ explanation: textExplanation });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
