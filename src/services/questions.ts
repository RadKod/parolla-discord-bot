import axiosInstance from "../utils/axiosInstance.js";

interface IProps {
    mode: string;
}
export const getQuestions = async (props: IProps) => {
    const questions = await axiosInstance.get(props.mode === "0" ? "/questions" : "/modes/unlimited").then((response) => {
        return response.data;
    }).catch((error) => {});
    return questions;
}
