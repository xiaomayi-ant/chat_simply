import { Message } from "@/types";
import { IconArrowUp } from "@tabler/icons-react";
import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";

interface Props {
  onSend: (message: Message) => void;
}

export const ChatInput: FC<Props> = ({ onSend }) => {
  const [content, setContent] = useState<string>();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length > 4000) {
      alert("Message limit is 4000 characters");
      return;
    }

    setContent(value);
  };

  const handleSend = () => {
    if (!content) {
      alert("Please enter a message");
      return;
    }
    onSend({ role: "user", content });
    setContent("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div className="w-full">
      <div className="flex items-center w-full rounded-2xl border-2 border-neutral-200 px-3 py-2">
        <textarea
          ref={textareaRef}
          className="flex-1 min-h-[32px] max-h-[200px] resize-none bg-transparent focus:outline-none focus:ring-0"
          placeholder="Type a message..."
          value={content}
          rows={1}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />

        <button
          type="button"
          onClick={handleSend}
          className="ml-2 hover:opacity-80"
        >
          <IconArrowUp className="h-8 w-8 hover:cursor-pointer rounded-full p-1 bg-blue-500 text-white" />
        </button>
      </div>
    </div>
  );
};
