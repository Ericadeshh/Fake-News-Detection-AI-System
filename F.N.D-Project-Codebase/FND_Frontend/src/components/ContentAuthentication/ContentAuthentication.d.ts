type InputMethod = "text" | "file" | "url";
interface InputState {
    text: string;
    file: File | null;
    url: string;
}
interface ContentAuthenticationProps {
    inputMethod: InputMethod;
    setInputMethod: (method: InputMethod) => void;
    input: InputState;
    setInput: React.Dispatch<React.SetStateAction<InputState>>;
    checkNews: () => void;
    isLoading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}
declare const ContentAuthentication: ({ inputMethod, setInputMethod, input, setInput, checkNews, isLoading, fileInputRef, }: ContentAuthenticationProps) => import("react").JSX.Element;
export default ContentAuthentication;
