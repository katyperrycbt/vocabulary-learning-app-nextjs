import { useEffect, useState } from "react";

import Router from "next/router";
import Image from "next/image";

import axios from "axios";

import { API } from "@config";
import { logout } from "@actions";
import { getJWT, handleCommonResponse, handleServerError } from "@utils";

import { Skeleton } from "@mui/material";

const Private = ({ children, MetaTag }) => {
    const [validate, setValidate] = useState(false);
    // const [login, setLogin] = useState(false);

    useEffect(() => {
        const pathname = window?.location?.pathname ? window.location.pathname : "";

        const validate = async () => {
            // check thử xem token nếu có thì có valid hay không
            let data;

            // check if session is valid
            const vipSession = localStorage.getItem("vip-session");

            // check if due date is in the future
            if (vipSession && new Date(vipSession) > new Date()) {
                data = 'OK';

                // extend session for 5 minutes
                localStorage.setItem("vip-session", new Date(new Date().getTime() + 1000 * 60 * 5).toString());
            } else {
                data = getJWT()
                    ? await axios
                        .get(`${API}/api/check-token`, {
                            headers: {
                                Authorization: `Bearer ${getJWT()}`,
                            },
                        })
                        .then((res) => handleCommonResponse(res))
                        .catch((err) => handleServerError(err, true))
                    : {
                        error: "Require log in",
                    };


                if (data?.error) {
                    logout(() =>
                        Router.push({
                            pathname: "/login",
                            query: {
                                message: "Limited access resources, please login to access.",
                                typeMessage: "warning",
                                url: `${pathname}`,
                            },
                        })
                    );
                    return;
                } else {
                    // extend session for 5 minutes
                    localStorage.setItem("vip-session", new Date(new Date().getTime() + 1000 * 60 * 5).toString());
                }
            }
        };

        validate().then(() => setValidate(true));
    }, []);

    if (!validate || !getJWT()) {
        return (
            <>
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                    }}
                >
                    <Skeleton
                        sx={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            // background: "linear-gradient(to right, #64b5f6 0%, #ffd54f 100%)",
                        }}
                        variant="rectangular"
                        animation="wave"
                        className="verifybg"
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: "45%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 150,
                            height: 150,
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
                                src="https://res.cloudinary.com/katyperrycbt/image/upload/v1645255746/Ellipsis-1s-200px_1_jii1o0.svg"
                                alt="Loading..."
                                layout="fill"
                                priority={true}
                                objectFit="cover"
                                draggable={false}
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            position: "absolute",
                            top: "55%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 250,
                            height: 150,
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
                                src="https://res.cloudinary.com/katyperrycbt/image/upload/v1645258177/Vanilla-1s-281px_3_y2ak29.svg"
                                alt="Loading..."
                                layout="fill"
                                priority={true}
                                objectFit="cover"
                                draggable={false}
                            />
                        </div>
                    </div>
                </div>
                {typeof MetaTag === "function" && <MetaTag />}
                {typeof MetaTag === "object" && MetaTag}
            </>
        );
    } else {
        return (
            <>
                {typeof MetaTag === "function" && <MetaTag />}
                {typeof MetaTag === "object" && MetaTag}
                {children}
            </>
        );
    }
};

export default Private;
