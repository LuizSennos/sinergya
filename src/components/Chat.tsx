import ChatHeader from "./ChatHeader";
import MessageCard from "./MessageBubble";
import { messages } from "@/data/messages";

export default function Chat() {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-white shadow-xl">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((msg) => (
            <MessageCard
              key={msg.id}
              type={msg.type}
              title={msg.type === "assistential" ? "Registro Assistencial" : "Observação Técnica"}
              text={msg.text}
              author={msg.author}
            />
          ))}
        </div>
      </div>
    </div>
  );
}