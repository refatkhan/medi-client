import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";
import { useContext } from "react";
import { AuthContext } from "../Provider/AuthProvider";

const useParticipantAnalytics = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();

    return useQuery({
        queryKey: ["participant-analytics", user?.email],
        enabled: !!user?.email,
        queryFn: async () => {
            const res = await axiosSecure.get(
                `/participant-analytics?email=${user.email}`
            );
            return res.data;
        },
    });
};

export default useParticipantAnalytics;
