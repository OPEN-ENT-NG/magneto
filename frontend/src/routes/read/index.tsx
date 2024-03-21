import {
    Box,
    Button,
    CardActions,
    CardContent,
    Typography,
} from "@mui/material";
import MaterialCard from "@mui/material/Card";
import { Link } from "react-router-dom";

const bull = (
    <Box
        component="span"
        sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
    >
        •
    </Box>
);

export const App = () => {
    console.log("i am in read");
    return (
        <>
            <div>coucou je suis info</div>

            <MaterialCard sx={{ minWidth: 275 }}>
                <CardContent>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                        read
                    </Typography>
                    <Typography variant="h5" component="div">
                        be{bull}read
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        read
                    </Typography>
                    <Typography variant="body2">
                        well read and read.
                        <br />
                        {'"a benevolent read"'}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="small">Learn More</Button>
                </CardActions>
            </MaterialCard>
            <Link to={`/user`}>click to access user </Link>
            <Link to={`/info`}>click to access info </Link>
            <Link to={`/board/{id}/view`}>click to access board </Link>
            <Link to={`/board/{id}/reading`}>click to access read </Link>
            <Link to={`/`}>click to access /</Link>
        </>
    );
};
