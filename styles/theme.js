import { Colors } from "@styles";

const MyTheme = (mode) => ({
    footer_title: {
        main: mode === "light" ? Colors.FOOTER_TITLE : Colors.WHITE,
    },
    footer_link: {
        main: mode === "light" ? Colors.FOOTER_LINK : Colors.WHITE,
    },
    black: {
        main: mode === "light" ? Colors.BLACK : Colors.WHITE,
    },
    white: {
        main: mode === "light" ? Colors.WHITE : Colors.BLACK,
    },
    mui_button: {
        main: mode === "light" ? Colors.MUI_BUTTON_LIGHT : Colors.GRAY_7,
    },
    mui_button_inner: {
        main: mode === "light" ? Colors.MUI_BUTTON_INNER : Colors.WHITE,
    },
    dashboard: {
        main: mode === "light" ? Colors.BG_MAIN : Colors.BG_MAIN_DARK,
        contrastText: "#fff",
    },
    img_bg: {
        main: mode === "light" ? Colors.IMG_GREY : Colors.IMG_GREY_DARK,
    },
    scroll_button: {
        main: mode === "light" ? "#fff" : "rgba(131, 119, 125, 0.8)",
        contrastText: mode === "light" ? "#000" : "#fff",
    },
    paper_grey: {
        main: mode === "light" ? "#fff" : Colors.PAPER_GREY_DARK,
    },
    paper_grey2: {
        main: mode === "light" ? "#fff" : Colors.SEARCH_DARK_GREY,
    },
    drawer: {
        main: mode === "light" ? Colors.GRAY_5 : Colors.WHITE,
    },
    publicWord1: {
        main: mode === "light" ? Colors.LOGO_RED : Colors.RED_PUBLIC_WORDS_DARK,
    },
    publicWord2: {
        main: mode === "light" ? Colors.BLUE_PUBLIC_WORDS : Colors.WHITE,
    },
    publicWord3: {
        main: mode === "light" ? Colors.BLUE_PUBLIC_WORDS : Colors.YELLOW_PUBLIC_WORDS_DARK,
    },
    relatedPaper: {
        main: mode === "light" ? `${Colors.LOGO_YELLOW}80` : Colors.IMG_GREY_DARK,
    },
    mainPublicWord: {
        main: mode === "light" ? Colors.BLUE_PUBLIC_WORDS : Colors.MAIN_PUBLIC_WORDS_DARK,
    },
    borderSearch: {
        main: mode === "light" ? Colors.GREY_200 : Colors.GREY_700,
    }
});

export default MyTheme;
