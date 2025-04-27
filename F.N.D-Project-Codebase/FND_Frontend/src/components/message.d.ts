interface MessageProps {
    message: string | null;
    type: "error" | "info" | "success";
}
declare const Message: ({ message, type }: MessageProps) => import("react").JSX.Element;
export default Message;
