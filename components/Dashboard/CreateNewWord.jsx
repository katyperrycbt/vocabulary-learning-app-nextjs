import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";

import Image from 'next/image';

import {
    Grid, TextField, InputLabel, Select, MenuItem,
    FormControl, Dialog, DialogActions,
    DialogContent, DialogTitle, OutlinedInput,
    ToggleButton, ToggleButtonGroup,
    Typography, Box, FormHelperText, Paper, FormLabel,
    CircularProgress, SvgIcon, Tooltip, Stack
} from "@mui/material";

import {
    Send as SendIcon,
    AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';

import { LoadingButton } from "@mui/lab";
import { useTheme } from '@mui/material/styles';

import { useDispatch } from "react-redux";

import Uploader from '@components/Upload';
import LoadingImage from '@components/LoadingImage';
import ListArrayInputs from './FormComponents/ListArrayInputs';
import ListInputs from './FormComponents/ListInputs';

import { IMAGE_ALT, VIP_TYPES } from "@consts";
import { fetcherJWT, createVIP } from "@actions";
import {
    useWindowSize, useThisToGetSizesFromRef,
    getJWT, groupBy, handleDictionaryData
} from '@utils';
import { Fonts, SXs } from "@styles";
import { API } from '@config';

import useSWR from 'swr';
import { debounce } from "lodash";

const fetcher = async (...args) => await fetcherJWT(...args);

const initForm = {
    vip: "",
    type: VIP_TYPES[0],
    examples: [],
    vnMeanings: [],
    engMeanings: [],
    pronounce: "",
    synonyms: [],
    antonyms: [],
    clasifyVocab: [],
    public: true,
    tags: [],
    auto: false
}

const initTempInputs = {
    example: "",
    vnMeaning: "",
    engMeaning: "",
    antonym: "",
    synonym: "",
    tag: "",
}

const resetSome = {
    pronounce: "",
    audio: "",
    clasifyVocab: [],
    examples: [],
    engMeanings: [],
    synonyms: [],
    tags: [],
    auto: false
}

export default function CreateNewWord({ open = false, setOpen }) {
    const theme = useTheme();
    const windowSize = useWindowSize();
    const dispatch = useDispatch();

    const photoRef = useRef(null);
    const [photo, setPhoto] = useState(null);
    const [isOver10MB, setIsOver10MB] = useState(false);

    const [vocabTypes, setVocabTypes] = useState([]);

    const [form, setForm] = useState(initForm);
    const [temptInput, setTemptInput] = useState(initTempInputs);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const pronounceRef = useRef(null);
    const [shouldFetchPronouce, setShouldFetchPronouce] = useState(false);

    const [fetchingAPI, setFetchingAPI] = useState(false);

    const resetWhole = () => {
        setTemptInput(initTempInputs);
        setForm(initForm);
        setPhoto(null);
        setErrors({});
        setLoading(false);
        setIsOver10MB(false);
        setVocabTypes([]);
        setFetchingAPI(false);
    }

    const handleClose = () => {
        // reset all
        resetWhole();

        setOpen(false);
    };

    // get types
    useSWR(getJWT() ? `${API}/api/type2s` : null, fetcher, {
        onSuccess: (data) => {
            const raw = data?.data;
            const types = raw?.sort((a, b) => a?.id - b?.id).map(item => ({
                value: item?.attributes?.name,
                id: item?.id
            }));
            setVocabTypes(types);
        }
    });

    useEffect(() => {
        const loop = setInterval(() => {
            if (!photo && window) {
                setPhoto(new FormData());
                clearInterval(loop);
            }
        }, 100);

        return () => clearInterval(loop);
    }, [photo]);

    // useDebounce(form.vip, () => handleFetchPronouce(), 2000);

    const photoSizes = useThisToGetSizesFromRef(
        photoRef,
        {
            revalidate: 250,
            falseCondition: (data) => data.width !== 0
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();

        let formData = new FormData();

        // prepare object
        const data = {
            vip: form.vip,
            type1: form.type,
            type2: form.type === "vocab"
                ? form.clasifyVocab.map((item) => {
                    const findItem = vocabTypes.find(each => each.value === item);
                    return vocabTypes.indexOf(findItem)
                })
                : null,
            examples: form.examples,
            pronounce: form.pronounce,
            meanings: { english: form.engMeanings, vietnamese: form.vnMeanings },
            synonyms: form.synonyms.join(","),
            antonyms: form.antonyms.join(","),
            tags: form.tags.join(","),
            public: form.public,
            audio: form.audio,
        }

        formData.append("data", JSON.stringify(data));
        formData.append("files.illustration", photo?.get('illustration'));

        let temp = {};
        for (let pair of formData.entries()) {
            temp[pair[0]] = pair[1];
        }

        if (window?.adHocFetch) {
            adHocFetch({
                dispatch,
                action: createVIP(formData),
                onSuccess: (data) => resetWhole(),
                onError: (error) => console.log(error),
                onStarting: () => setLoading(true),
                onFinally: () => setLoading(false),
                snackbarMessageOnSuccess: "Added!"
            })
        }
    };

    const handleFetchPronouce = useCallback(async (value) => {
        if (!value) {
            setForm((form) => ({ ...form, ...resetSome }));
            setFetchingAPI(false);
            return;
        }
        try {
            setFetchingAPI(true);
            const res = await fetch(
                `https://api.dictionaryapi.dev/api/v2/entries/en/${value}`,
            );
            const data = await res.json();

            setFetchingAPI(false);

            const firstData = data?.[0];

            if (!data.message && firstData?.word === value) {
                const processedData = handleDictionaryData(firstData, vocabTypes);
                setForm((form) => ({ ...form, ...processedData, auto: true }));
            } else {
                setForm((form) => ({ ...form, ...resetSome }));
            }
        } catch (e) {
            console.log(e);
            setForm((form) => ({ ...form, ...resetSome }));
            setFetchingAPI(false);
        }
    }, [vocabTypes]);

    const debounceFunction = useMemo(() => debounce((e) => {
        handleChangeValue(e, "vip");
        checkInputCriteria(e, "vip");
        handleFetchPronouce(e.target.value);
    }, 1000), [handleFetchPronouce, checkInputCriteria]);

    const debounceFetchPronouce = (e) => {
        debounceFunction(e);
    };

    const handleChangeValue = (e, name) => {
        setForm((state) => ({ ...state, [name]: e.target.value }));
    };

    const handleChangeTemptInput = (e, name) => {
        setTemptInput((state) => ({ ...state, [name]: e.target.value }));
    };

    const clearTemptInputField = (name) =>
        setTemptInput((state) => ({ ...state, [name]: "" }));

    const handleDeleteItem = (field, index) => {
        setForm((state) => ({
            ...state,
            [field]: state[field].filter((item, i) => index !== -10 ? i !== index : false),
        }));
    };

    const addToFormState = (e, value, formField) => {
        e.preventDefault();
        if (temptInput[value]) {
            setForm((state) => ({
                ...state,
                [formField]: [...state[formField], temptInput[value]],
            }));
        }
    };

    const canSubmit = () =>
        (
            form.vip?.length
            && form.examples?.length
            && (form.vnMeanings?.length || form.engMeanings?.length)
            && form.tags?.length
            && !errors?.vip.error?.length
            && !errors?.examples?.length
            && !errors?.meanings?.length
            && !errors?.tags?.length
            && !(Math.ceil(isOver10MB / 1024 / 1024) > 10)
        ) ?? false;

    const checkInputCriteria = useCallback((e, name) => {
        let error = {};
        switch (name) {
            case "engMeanings", "vnMeanings":
                error = (!e.target.value?.length && !form.vnMeanings.length && !form.engMeanings.length)
                    ? "At least one meaning in Vietnamese (or English)"
                    : "";
                setErrors((state) => ({ ...state, ["meanings"]: error }));
                return;
            default:
                error = e.target.value?.length
                    ? ""
                    : "This field is required";
                setErrors((state) => ({
                    ...state,
                    [name]: error,
                }));
        }
    }, [form.vnMeanings, form.engMeanings]);

    const handleVocabTypesChange = (e) => {
        const { target: { value } } = e;
        setForm((state) => ({
            ...state,
            ["clasifyVocab"]: typeof value === "string" ? value.split(",") : value,
        }));
    };

    const listInputProps = {
        temptInput,
        handleChangeTemptInput,
        checkInputCriteria,
        clearTemptInputField,
        addToFormState
    }

    const gridForm = () => (
        <Box
            sx={{
                width: "100%",
                pointerEvents: loading ? 'none' : 'auto',
                opacity: loading ? '0.2' : '1'
            }}
            className={loading ? 'noselect' : ''}
        >
            <Box component="form" noValidate onSubmit={handleSubmit}>
                <Grid container>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            label="Word"
                            id="word"
                            size="small"
                            margin="dense"
                            error={errors?.vip?.length > 0}
                            helperText={errors?.vip || "A vocabulary, idiom or phrase"}
                            onChange={debounceFetchPronouce}
                            InputLabelProps={{
                                shrink: true
                            }}
                        />
                    </Grid>

                    <Grid item xs={4} pr={0.5}>
                        <FormControl fullWidth margin="dense" required>
                            <InputLabel id="demo-multiple-chip-label">Type</InputLabel>
                            <Select
                                size="small"
                                margin="dense"
                                id="demo-simple-select"
                                value={form.type}
                                label="Type"
                                onChange={(e) => {
                                    handleChangeValue(e, "type");
                                }}
                            >
                                {VIP_TYPES.map((type, index) => (
                                    <MenuItem key={`${type}-${index}`} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Vocab, idiom or phrase</FormHelperText>
                        </FormControl>
                    </Grid>

                    {form.type === "vocab" && (
                        <Grid item xs={8} pl={0.5}>
                            <FormControl fullWidth margin="dense" size="small" required>
                                <InputLabel id="demo-multiple-chip-label"
                                    sx={form.auto ? {
                                        ...SXs.AUTO_FILLED_TEXT_COLOR,
                                        display: "flex",
                                    } : {}}
                                >
                                    <SpecialLabel label="Classify" auto={form.auto} />
                                </InputLabel>
                                <Select
                                    labelId="demo-multiple-chip-label"
                                    id="demo-multiple-chip"
                                    multiple
                                    value={form.clasifyVocab}
                                    onChange={handleVocabTypesChange}
                                    label={<SpecialLabel label="Classify" auto={form.auto} />}
                                    input={
                                        <OutlinedInput
                                            id="select-multiple-chip"
                                            label={<SpecialLabel label="Classify" auto={form.auto} />}
                                        />
                                    }
                                >
                                    {vocabTypes?.map(item => item.value)?.map((name, index) => (
                                        <MenuItem key={`${name}-type2-${index}`} value={name}>
                                            {name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>Multi-selection</FormHelperText>
                            </FormControl>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            inputRef={pronounceRef}
                            label={<SpecialLabel label="Pronounce" auto={form.auto} />}
                            id="pronounce"
                            size="small"
                            margin="dense"
                            multiline
                            InputLabelProps={{
                                sx: form.auto ? SXs.AUTO_FILLED_TEXT_COLOR : {},
                                shrink: form.pronounce?.length > 0
                            }}
                            error={errors?.pronounce?.length > 0}
                            helperText={errors?.pronounce || "Optional"}
                            value={form.pronounce}
                            onChange={(e) => {
                                handleChangeValue(e, "pronounce");
                                checkInputCriteria(e, "pronounce");
                            }}
                        />
                    </Grid>

                    <ListArrayInputs {...elementsListProps(form, handleDeleteItem).examples} />
                    <ListInputs {...elementsInputProps(errors, listInputProps).examples} />

                    <ListArrayInputs {...elementsListProps(form, handleDeleteItem).english} />
                    <ListInputs {...elementsInputProps(errors, listInputProps).english} />

                    <ListArrayInputs {...elementsListProps(form, handleDeleteItem).vietnamese} />
                    <ListInputs {...elementsInputProps(errors, listInputProps).vietnamese} />

                    <ListArrayInputs {...elementsListProps(form, handleDeleteItem).synonyms} />
                    <ListInputs {...elementsInputProps(errors, listInputProps).synonyms} />

                    <ListArrayInputs {...elementsListProps(form, handleDeleteItem).antonyms} />
                    <ListInputs {...elementsInputProps(errors, listInputProps).antonyms} />

                    <ListArrayInputs {...elementsListProps(form, handleDeleteItem).tags} />
                    <ListInputs {...elementsInputProps(errors, listInputProps).tags} />

                    <Grid item xs={12} mt={1} ref={photoRef}>
                        <FormControl fullWidth error={Math.ceil(isOver10MB / 1024 / 1024) > 10}>
                            <FormLabel>Illustration</FormLabel>
                            <Paper variant='outlined' sx={{
                                position: 'relative',
                                height: photoSizes?.width,
                                overflow: 'hidden',
                                borderRadius: '10px'
                            }}>
                                <Uploader
                                    containerProps={{
                                        sx: {
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            zIndex: 2,
                                            width: '100%',
                                            height: '100%',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        },
                                        container: true
                                    }}
                                    stylesImage={{
                                        style: {
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                        }
                                    }}
                                    stylesImage2={{
                                        style: {
                                            width: '100%',
                                            height: '100%',
                                            position: 'relative'
                                        }
                                    }}
                                    setData={(data, base64) => {
                                        photo?.set('illustration', data);
                                        photo?.set('photo', base64);
                                        setPhoto(photo);
                                    }}
                                    data={Boolean(photo?.get('photo')) ? photo?.get('photo') : null}
                                    CustomIcon={UploadIconIllustration}
                                    showIconUpload={Boolean(photo?.get('photo')) ? false : true}
                                    getFileSize={(data) => setIsOver10MB(data)}
                                    isFormik
                                    clickWhole
                                />
                            </Paper>
                            <FormHelperText>
                                {Math.ceil(isOver10MB / 1024 / 1024) > 10
                                    ? 'File size is over 10MB.'
                                    : (isOver10MB
                                        ? `THis file's size is ${Math.ceil(isOver10MB / 1024 / 1024)}MB.`
                                        : 'Should be in square shape. MUST smaller 10MB in size.'
                                    )}
                            </FormHelperText>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );

    return (
        <div>
            <Dialog
                open={open}
                onClose={loading ? null : handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                scroll="paper"
                maxWidth="xs"
                fullScreen={windowSize?.width < theme.breakpoints.values.sm ? true : false}
                onSubmit={handleSubmit}
            >
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 150,
                    height: 150,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 100,
                    display: loading ? 'flex' : 'none',
                }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <LoadingImage
                            src="https://res.cloudinary.com/katyperrycbt/image/upload/v1645255061/Spinner-1s-200px_3_m1pkiz.svg"
                            alt="Illustration"
                            objectFit='contain'
                            priority={true}
                            draggable={false}
                            bgColor="transparent"
                            layout='fill'
                        />
                    </div>
                </div>
                <DialogTitle id="scroll-dialog-title" sx={{
                    py: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        position: 'relative',
                        width: 50, height: 50,
                        display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Image
                            src="/logo.icon.svg"
                            width={fetchingAPI ? 15 : 30}
                            height={fetchingAPI ? 15 : 30}
                            alt="Logo"
                        />
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: fetchingAPI ? 'flex' : 'none',
                        }}>
                            <div style={{
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                            }}>
                                <Image
                                    src="https://res.cloudinary.com/katyperrycbt/image/upload/v1645608152/Double_Ring-1s-200px_nw6bl0.svg"
                                    alt="Logo"
                                    layout='fill'
                                />
                            </div>
                        </div>
                    </div>

                    <Typography
                        id="modal-modal-title"
                        align="center"
                        sx={{
                            fontSize: Fonts.FS_20,
                            fontWeight: Fonts.FW_500,
                            ml: 1
                        }}
                    >
                        {
                            !fetchingAPI ? 'New Word' : 'Loading...'
                        }
                    </Typography>
                </DialogTitle>

                <DialogContent dividers>{gridForm()}</DialogContent>

                <DialogActions sx={{
                    justifyContent: 'space-between',
                }}>
                    <div>
                        <ToggleButtonGroup
                            size="small"
                            color="primary"
                            value={form?.public?.toString()}
                            exclusive
                            onChange={(e) =>
                                setForm((state) => ({
                                    ...state,
                                    ["public"]: e.target.value === "true",
                                }))
                            }
                            disabled={loading}
                        >
                            <ToggleButton value="false" sx={SXs.TOGGLE_BUTTON_STYLES}>Private</ToggleButton>
                            <ToggleButton value="true" sx={SXs.TOGGLE_BUTTON_STYLES}>Public</ToggleButton>
                        </ToggleButtonGroup>
                    </div>
                    <div>
                        <LoadingButton sx={{
                            ...SXs.LOADING_BUTTON_STYLES,
                            mr: 1
                        }} onClick={handleClose}>Cancel</LoadingButton>
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            loadingPosition="start"
                            sx={SXs.LOADING_BUTTON_STYLES}
                            disabled={!canSubmit()}
                            loading={loading}
                            onClick={handleSubmit}
                            startIcon={<SendIcon />}
                        >
                            Create
                        </LoadingButton>
                    </div>
                </DialogActions>
            </Dialog>
        </div>
    );
}

const UploadIconIllustration = () => {
    return <LoadingImage
        src={IMAGE_ALT}
        alt="Illustration"
        objectFit='contain'
        priority={true}
        draggable={false}
        width={200}
        height={200}
        bgColor="transparent"
    />
}

const SpecialLabel = ({ auto, label }) => {
    return !auto ? `${label}` : (<Tooltip title="Auto-filled" sx={{ display: 'flex' }}>
        <Stack direction='row' alignItems='center' sx={{ display: 'flex' }}>
            {label}
            <SvgIcon fontSize='inherit' sx={{ verticalAlign: 'middle', ml: 0.5 }}>
                <defs>
                    <linearGradient id="Gradient1">
                        <stop offset="0%" stopColor="#ffd54f" />
                        <stop offset="100%" stopColor="#64b5f6" />
                    </linearGradient>
                </defs>
                <AutoAwesomeIcon sx={{
                    '&.MuiSvgIcon-root': {
                        '*': { fill: `url(#Gradient1) #fff` }
                    },
                }} color='inherit' >
                </AutoAwesomeIcon>
            </SvgIcon>
        </Stack>
    </Tooltip>)
}

const elementsInputProps = (errors, others) => ({
    examples: {
        temptField: "example",
        formField: "examples",
        helperText: "At least one example",
        label: "Examples",
        error: errors?.examples,
        required: true,
        ...others
    },
    vietnamese: {
        temptField: "vnMeaning",
        formField: "vnMeanings",
        helperText: "At least one meaning in total (English + Vietnamese)",
        label: "Vietnamese",
        error: errors?.meanings,
        required: true,
        ...others
    },
    english: {
        temptField: "engMeaning",
        formField: "engMeanings",
        helperText: "At least one meaning in total (English + Vietnamese)",
        label: "English",
        error: errors?.meanings,
        required: true,
        ...others
    },
    antonyms: {
        temptField: "antonym",
        formField: "antonyms",
        label: "Antonyms",
        ...others
    },
    synonyms: {
        temptField: "synonym",
        formField: "synonyms",
        label: "Synonyms",
        ...others
    },
    tags: {
        temptField: "tag",
        formField: "tags",
        error: errors?.tags,
        label: "Tags",
        helperText: "At least one tag",
        required: true,
        ...others
    }
});

const elementsListProps = (form, handleDeleteItem) => ({
    examples: {
        formField: "examples",
        label: "Examples",
        form, handleDeleteItem
    },
    vietnamese: {
        formField: "vnMeanings",
        label: "Vietnamese",
        form, handleDeleteItem
    },
    english: {
        formField: "engMeanings",
        label: "English",
        form, handleDeleteItem
    },
    antonyms: {
        formField: "antonyms",
        label: "Antonyms",
        form, handleDeleteItem
    },
    synonyms: {
        formField: "synonyms",
        label: "Synonyms",
        form, handleDeleteItem
    },
    tags: {
        formField: "tags",
        label: "Tags",
        form, handleDeleteItem
    }
})