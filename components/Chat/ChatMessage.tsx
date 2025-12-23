import { Message } from "@/types";
import { FC } from "react";
import ReactMarkdown from "react-markdown";

interface Props {
  message: Message;
}

export const ChatMessage: FC<Props> = ({ message }) => {
  return (
    <div className={`flex flex-col ${message.role === "assistant" ? "items-start" : "items-end"}`}>
      <div
        className={`inline-block max-w-full ${
          message.role === "assistant"
            ? "bg-neutral-100 text-neutral-900"
            : "bg-blue-500 text-white"
        } rounded-2xl px-3 py-2 whitespace-pre-wrap`}
        style={{ overflowWrap: "anywhere" }}
      >
        {message.role === "assistant" ? (
          <ReactMarkdown
            components={{
              // 优化图片显示样式，防止图太大撑破布局
              img: ({ node, ...props }) => (
                <img
                  {...props}
                  style={{
                    maxWidth: "100%",
                    borderRadius: "8px",
                    marginTop: "10px",
                    display: "block",
                  }}
                  alt={props.alt || "Chart"}
                />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        ) : (
          message.content
        )}
      </div>
    </div>
  );
};
