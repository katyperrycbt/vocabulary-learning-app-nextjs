import { useState, useEffect, useRef } from 'react';

import {
    Grid, ImageList, ImageListItem, Typography,
    Skeleton
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import { Box } from "@mui/system";
import { Fonts, Props } from "@styles";
import { getPastelColor, getSizeImage, useThisToGetSizesFromRef, useWindowSize } from '@utils';

import LoadingImage from "@components/LoadingImage";

const ImageGallery = (props) => {

    const { illustrationsList, setCurrentImg, vips } = props;
    const [imgSizes, setImgSizes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bgColors, setBgColors] = useState([]);

    const myRef = useRef(null);
    const theme = useTheme();
    const windowSize = useWindowSize();

    useEffect(() => {
        const loop = setInterval(() => {
            if (imgSizes.filter((item) => item.width > 0 && item.height > 0).length !== illustrationsList?.length) {
                setLoading(true);
                illustrationsList?.forEach((img, index) => {
                    const photo = img?.formats?.small?.url || img?.formats?.medium?.url || img?.formats?.large?.url || img.url;
                    getSizeImage(photo, (data) => {
                        setImgSizes((prev) => {
                            prev[index] = data;
                            return prev;
                        });
                    });
                })
            } else {
                clearInterval(loop);
                setLoading(false);
            }
        }, 500)

        return () => clearInterval(loop);
    }, [illustrationsList, imgSizes]);

    useEffect(() => { 
        if (illustrationsList?.length !== bgColors?.length) {
            setBgColors(illustrationsList?.map(() => getPastelColor()));
        }
    }, [illustrationsList, bgColors?.length]);

    const containerSize = useThisToGetSizesFromRef(myRef, {
        revalidate: 1000,
        terminalCondition: ({ width }) => width !== 0,
        falseCondition: ({ width }) => width === 0,
    });

    const cols = windowSize?.width < theme.breakpoints.values.sm ? 3 : windowSize?.width < theme.breakpoints.values.md ? 4 : 5;

    const skeletonWidth = Math.floor((containerSize.width / (cols + 0.15)))*0.985;

    return (
        <>
            <Grid container {...Props.GCRCS}>
                <Grid item xs={12} mt={[5, 5, 3]}>
                    <Typography
                        variant="h1"
                        align="center"
                        sx={{ fontSize: Fonts.FS_27, fontWeight: Fonts.FW_400 }}
                    >
                        Image Library
                    </Typography>
                    <Typography
                        variant="h2"
                        color="text.secondary"
                        align="center"
                        sx={{ fontSize: Fonts.FS_16, fontWeight: Fonts.FW_400, mt: 2 }}
                    >
                        Select an image to view its details
                    </Typography>
                </Grid>

                <Grid item xs={12} {...Props.GIRCC} sx={{ mt: [2, 3, 4] }}>
                    <Box sx={{ width: ["100%", "95%"] }}>

                        <ImageList variant="masonry" cols={cols} gap={8} ref={myRef}>
                            {!loading && illustrationsList.map((illustration, index) => {
                                const photo = illustration?.formats?.small?.url || illustration?.formats?.medium?.url || illustration?.formats?.large?.url || illustration?.url;
                                // const bgColor = getPastelColor();
                                return (
                                    <ImageListItem key={index}>
                                        {
                                            !isNaN(imgSizes?.[index]?.height * skeletonWidth / imgSizes?.[index]?.width) && <label title={`Word: ${illustration.word}. Photo: ${illustration.name}` || 'Photo'}>
                                                <LoadingImage
                                                    src={`${photo}`}
                                                    loading="lazy"
                                                    width={skeletonWidth}
                                                    height={imgSizes[index]?.height * skeletonWidth / imgSizes[index]?.width}
                                                    alt={illustration?.name || 'Photo'}
                                                    onClick={() => setCurrentImg(illustration)}
                                                    quality={100}
                                                    bgColor={bgColors[index]}
                                                    draggable={false}
                                                    className="cursorPointer"
                                                />
                                            </label>
                                        }
                                    </ImageListItem>
                                )
                            })}
                            {loading && [
                                <ImageListItem key={`skeleton-1`}><Skeleton variant="rectangular" animatin="wave" width={skeletonWidth} height={skeletonWidth * 0.8} /></ImageListItem>,
                                <ImageListItem key={`skeleton-2`}><Skeleton variant="rectangular" animatin="wave" width={skeletonWidth} height={skeletonWidth * 1.66} /></ImageListItem>,
                                <ImageListItem key={`skeleton-3`}><Skeleton variant="rectangular" animatin="wave" width={skeletonWidth} height={skeletonWidth * 1.7} /></ImageListItem>,
                                <ImageListItem key={`skeleton-4`}><Skeleton variant="rectangular" animatin="wave" width={skeletonWidth} height={skeletonWidth * 0.4} /></ImageListItem>,
                                <ImageListItem key={`skeleton-5`}><Skeleton variant="rectangular" animatin="wave" width={skeletonWidth} height={skeletonWidth * 1.3} /></ImageListItem>,
                                <ImageListItem key={`skeleton-6`}><Skeleton variant="rectangular" animatin="wave" width={skeletonWidth} height={skeletonWidth * 0.95} /></ImageListItem>,
                                <ImageListItem key={`skeleton-7`}><Skeleton variant="rectangular" animatin="wave" width={skeletonWidth} height={skeletonWidth * 1.5} /></ImageListItem>,
                                <ImageListItem key={`skeleton-8`}><Skeleton variant="rectangular" animatin="wave" width={skeletonWidth} height={skeletonWidth * 0.55} /></ImageListItem>,
                                <ImageListItem key={`skeleton-9`}><Skeleton variant="rectangular" animatin="wave" width={skeletonWidth} height={skeletonWidth * 1.44} /></ImageListItem>,
                                <ImageListItem key={`skeleton-10`}><Skeleton variant="rectangular" animatin="wave" width={skeletonWidth} height={skeletonWidth * 0.45} /></ImageListItem>,
                                <ImageListItem key={`skeleton-11`}><Skeleton variant="rectangular" animatin="wave" width={skeletonWidth} height={skeletonWidth * 0.60} /></ImageListItem>,
                            ]}
                        </ImageList>

                    </Box>
                </Grid>
            </Grid>
        </>
    );
};

export default ImageGallery;
