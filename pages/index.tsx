import { Chat } from "@/components/Chat/Chat";
import { ChatInput } from "@/components/Chat/ChatInput";
import { Footer } from "@/components/Layout/Footer";
import { Navbar } from "@/components/Layout/Navbar";
import { Message } from "@/types";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (message: Message) => {
    const updatedMessages = [...messages, message];

    setMessages(updatedMessages);
    setLoading(true);

    // 获取后端API地址，默认为 http://localhost:8000
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    try {
      // 直接调用后端 FastAPI 的流式聊天端点
      const response = await fetch(`${apiUrl}/v1/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: message.content, // 发送用户消息内容
          system_prompt: "你是一个友好的AI助手" // 可选的系统提示词
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`后端API错误: ${response.status} - ${errorText}`);
      }

      const data = response.body;

      if (!data) {
        return;
      }

      // 处理SSE格式的流式响应
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let isFirst = true;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // 解码数据块
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // 处理SSE格式：按 \n\n 分割消息
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || ""; // 保留最后一个可能不完整的消息

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6); // 去掉 "data: " 前缀

              // 检查结束信号
              if (jsonStr === "[DONE]") {
                return;
              }

              try {
                const data = JSON.parse(jsonStr);

                // 处理不同类型的消息
                if (data.type === "token") {
                  // Token内容，追加到助手消息
                  if (isFirst) {
                    isFirst = false;
                    setMessages((messages) => [
                      ...messages,
                      {
                        role: "assistant",
                        content: data.content
                      }
                    ]);
                  } else {
                    setMessages((messages) => {
                      const lastMessage = messages[messages.length - 1];
                      if (lastMessage.role === "assistant") {
                        const updatedMessage = {
                          ...lastMessage,
                          content: lastMessage.content + data.content
                        };
                        return [...messages.slice(0, -1), updatedMessage];
                      }
                      return messages;
                    });
                  }
                } else if (data.type === "status") {
                  // 状态消息，可以显示在UI上（可选）
                  console.log("[状态]", data.content);
                } else if (data.type === "error") {
                  // 错误消息
                  console.error("[错误]", data.content);
                  throw new Error(data.content);
                }
              } catch (e) {
                console.error("解析SSE数据错误:", e, "原始数据:", jsonStr);
              }
            }
          }
        }
      } catch (error) {
        console.error("读取流式数据错误:", error);
        throw error;
      } finally {
        // 关键修复：在流式读取完成后（无论成功还是失败）再关闭 loading
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("发送消息错误:", error);
      alert(`发送消息失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: `Hi there! I'm Chatbot UI, an AI assistant. I can help you with things like answering questions, providing information, and helping with tasks. How can I help you?`
      }
    ]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `Hi there! I'm Chatbot UI, an AI assistant. I can help you with things like answering questions, providing information, and helping with tasks. How can I help you?`
      }
    ]);
  }, []);

  return (
    <>
      <Head>
        <title>Chatbot UI</title>
        <meta
          name="description"
          content="A simple chatbot starter kit for OpenAI's chat model using Next.js, TypeScript, and Tailwind CSS."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link
          rel="icon"
          href="/favicon.ico"
        />
      </Head>

      <div className="flex flex-col h-screen">
        <Navbar />

        <div className="flex-1 flex flex-col px-4 sm:px-10 pb-4 sm:pb-10">
          <div className="flex-1 flex flex-col max-w-[800px] mx-auto">
            {/* 消息滚动区域 */}
            <div className="flex-1 overflow-auto mt-4 sm:mt-12 space-y-4 sm:space-y-6">
              <Chat messages={messages} loading={loading} />
              <div ref={messagesEndRef} />
            </div>

            {/* 固定在内容区域底部的输入框（与消息同一列宽度） */}
            <div className="mt-2 sm:mt-4">
              <ChatInput onSend={handleSend} />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
