import axiosInstance from "../utils/axiosInstance.js";
export const getQuestions = async (props) => {
    const questions = await axiosInstance.get(props.mode === "0" ? "/questions" : "/modes/unlimited").then((response) => {
        return response.data;
    }).catch((error) => { });
    return questions;
};
//# sourceMappingURL=questions.js.map