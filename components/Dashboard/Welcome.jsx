import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
    Container,
    Grid,
    Box,
    Typography,
    IconButton,
    Button,
} from "@mui/material";
import CachedIcon from "@mui/icons-material/Cached";
import AddIcon from "@mui/icons-material/Add";

import CreateNewWord from "./CreateNewWord";
import WordCard from "./WordCard";

import { getLastReviewWord } from "@utils";
import { Colors, Fonts } from "@styles";

const Welcome = (props) => {
    const [openNewWordForm, setOpenNewWordForm] = useState(false);
    const [openReviseWordModal, setOpenReviseWordModal] = useState(false);

    const User = useSelector((state) => state.userData);
    const [reviewList, setReviewList] = useState(null);

    useEffect(() => {
        if (User?.vips && !reviewList?.length) {
            setReviewList(getLastReviewWord([...User.vips]));
        }
    }, [User?.vips, reviewList]);

    return (
        <Container maxWidth="lg" disableGutters>
            <Grid container direction="row" mt={[0, 1, 2, 3]}>
                <Grid
                    item
                    xs={12}
                    sm={6}
                    sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                    }}
                >
                    <Box sx={{ width: "100%" }}>
                        <Typography
                            component="h1"
                            sx={{
                                fontSize: Fonts.FS_24,
                                p: "16px 0px 0px",
                                fontWeight: Fonts.FW_500,
                            }}
                        >
                            Welcome back, {User?.name}! We missed you 👋
                        </Typography>
                        <Typography
                            component="p"
                            sx={{ fontSize: Fonts.FS_15, p: "8px 0px 0px" }}
                        >
                            It look like you haven&apos;t been revised your words today.
                            <Button
                                disabled={!reviewList?.length}
                                onClick={() => setOpenReviseWordModal(true)}
                            >
                                Let&apos;s check it out!
                            </Button>
                        </Typography>
                    </Box>
                </Grid>

                <Grid
                    item
                    xs={12}
                    sm={6}
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                    }}
                >
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: ["flex-start", "flex-end"],
                            padding: "10px 0",
                        }}
                    >
                        <IconButton>
                            <CachedIcon sx={{ color: Colors.LOGO_BLUE }} />
                        </IconButton>
                        <IconButton onClick={() => setOpenNewWordForm(true)}>
                            <AddIcon sx={{ color: Colors.LOGO_BLUE }} />
                        </IconButton>
                    </Box>
                </Grid>
            </Grid>
            <CreateNewWord open={openNewWordForm} setOpen={setOpenNewWordForm} />
            {reviewList?.length && (
                <WordCard
                    open={openReviseWordModal}
                    setOpen={setOpenReviseWordModal}
                    wordList={reviewList}
                />
            )}
        </Container>
    );
};

export default React.memo(Welcome);
