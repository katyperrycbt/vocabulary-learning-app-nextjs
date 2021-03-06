import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

import Image from "next/image";

import { Skeleton, Grid, Typography } from "@mui/material";

import { IMAGE_ALT } from "@consts";
import { useTheme } from "@mui/styles";

import _ from "lodash";

const defaultImg = {
    src: IMAGE_ALT,
    alt: 'No image',
    layout: 'fill',
    draggable: false
}

const Index = (props) => {
    const theme = useTheme();
    const { doneLoading, bgColor, blurDataURL, borderRadius, ...imgProps } = useMemo(() => props, [props]);

    const [loading, setLoading] = useState(true);
    const [localProps, setLocalProps] = useState(defaultImg);
    const memoizedProps = useMemo(() => localProps, [localProps]);

    useEffect(() => {
        let isMounted = true;

        if (!_.isEqual(localProps, imgProps) && isMounted) {
            setLocalProps(imgProps);
        }

        return () => isMounted = false;
    }, [imgProps, localProps]);

    if (!memoizedProps || !memoizedProps.src) {
        return <div>No src found.</div>
    }

    return (
        <div style={
            imgProps?.width && imgProps?.height ?
                { position: "relative", width: imgProps?.width, height: imgProps?.height, maxWidth: "100%", maxHeight: "100%" } :
                { position: "relative", width: "100%", height: "100%" }
        }>
            <div style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }}>
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        opacity: loading ? (blurDataURL ? 1 : 0) : 1,
                        backgroundColor: bgColor || theme?.palette?.img_bg?.main,
                        borderRadius: borderRadius || '0px',
                        overflow: "hidden",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >

                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image
                        {...memoizedProps}
                        onLoadingComplete={() => {
                            setLoading(false);
                            if (_.isFunction(doneLoading)) {
                                doneLoading();
                            }
                        }}
                    />

                </div>
            </div>
            {
                loading && !blurDataURL && (
                    <Skeleton
                        sx={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            top: 0,
                            left: 0,
                            background: "linear-gradient(to right, #64b5f6 0%, #ffd54f 100%)",
                            borderRadius: borderRadius || '0px',
                        }}
                        variant="rectangular"
                        animation="wave"
                    />
                )
            }
            {
                loading && !blurDataURL && (
                    <div
                        style={{
                            position: "absolute",
                            width: imgProps?.width || 100,
                            height: imgProps?.height || 100,
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                                width: "100%",
                                height: "100%",
                            }}
                        >
                            <Image
                                // src="https://res.cloudinary.com/katyperrycbt/image/upload/v1645240546/Dual_Ball-1s-200px_tbjrjw.svg"
                                src="https://res.cloudinary.com/katyperrycbt/image/upload/v1647488137/Dual_Ball-1s-200px_2_uahymn.svg"
                                alt="Loading"
                                layout="fill"
                                objectFit="cover"
                                loading="eager"
                                draggable={false}
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Index;
