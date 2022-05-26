import React, { useEffect, useState } from 'react';
import { 
    Alert,
    AppBar, 
    Box, 
    Card, 
    CardActionArea, 
    CardContent, 
    CardMedia, 
    Chip, 
    CircularProgress, 
    Container, 
    Dialog, 
    DialogContent, 
    DialogTitle, 
    Grid, 
    Stack, 
    TextField, 
    Toolbar, 
    Typography 
} from '@mui/material';

const API_KEY = '3d58b9ecc0aeb1a323777996ebd2572b';

const SearchBox = ({searchHandler}) => {
    return (
        <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
        >

            <Grid item xs={3}>
                <TextField
                    id="movie-name"
                    label="Movie Name"
                    onChange={(e) => searchHandler(e.target.value)}
                    style={{ minWidth: '100vh' }}
                />
            </Grid>
        </Grid>
    )
}

const ColCardBox = ({name, id, poster_path, vote_average, year, ShowDetail, DetailRequest, ActivateModal}) => {

    const clickHandler = () => {

        // Display Modal and Loading Icon
        ActivateModal(true);
        DetailRequest(true);

        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`)
        .then(resp => resp)
        .then(resp => resp.json())
        .then(response => {
            console.log(response)
            if (response != null) {
                ShowDetail(response);
                DetailRequest(false);
            }
        })
        .catch(({message}) => {
            DetailRequest(false);
        })
    }

    return (
        <Grid item xs={12} sm={4} md={3} lg={2}>
            <Card>
                <CardActionArea onClick={clickHandler}>
                    <CardMedia
                        component="img"
                        height="300"
                        image={poster_path === null ? 'https://via.placeholder.com/300x450&text=Image+Not+Found' : "https://image.tmdb.org/t/p/w300" + poster_path}
                        alt={name}
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            {name}
                            <Chip label={vote_average} size="small" style={{marginLeft: '10px'}} />
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Grid>
    )
}

const MovieDetail = ({title, poster_path, vote_average, runtime, genres, overview}) => {
    if (genres != null) {
        genres = genres.map(genre => genre.name).join(', ');
    }
    return (
        <Grid container spacing={2} columns={24}>
            <Grid item xs={9}>
                <img src={poster_path === null ? 'https://placehold.it/300x450&text=Image+Not+Found' : "https://image.tmdb.org/t/p/w300" + poster_path} alt={title} />
            </Grid>
            <Grid item xs={15}>
                <Grid item xs container direction="column" spacing={2}>
                    <Grid item>
                        <Typography variant="h5" gutterBottom>
                            {title}
                            <Chip label={vote_average} size="small" style={{marginLeft: '10px'}} />
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Chip size="small" label={runtime} variant="outlined" />
                            <Chip size="small" label={genres} variant="outlined" />
                        </Stack>
                    </Grid>
                    <Grid item style={{ marginBottom: "50px" }}>
                        {overview}
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

const Loader = () => (
    <div style={{margin: '20px 0', textAlign: 'center'}}>
        <CircularProgress />
    </div>
)

function App() {

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState(null);
    const [activateModal, setActivateModal] = useState(false);
    const [detail, setShowDetail] = useState(false);
    const [detailRequest, setDetailRequest] = useState(false);

    // debounce setQuery to prevent multiple request after 1 second
    const debounce = (func, delay) => {
        let inDebounce;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(inDebounce);
            inDebounce = setTimeout(() => func.apply(context, args), delay);
        }
    }

    const initData = () => {
        fetch('https://rhld16.duckdns.org/sssf/movies')
        .then(resp => resp.json())
        .then(response => {
            setData(response);
        });
    }

    const searchHandler = debounce((query) => {
        setQuery(query);
    }, 1000);

    useEffect(() => {

        setLoading(true);
        setError(null);
        setData(null);

        if (query === "") {
            initData();
        } else {
            fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}`)
            .then(resp => resp)
            .then(resp => resp.json())
            .then(response => {
                if (response.results != null) {
                    setData(response.results.filter(item => item.media_type === "movie"));
                }
                else {
                    setError(response.status_message);
                }

                setLoading(false);
            })
            .catch(({message}) => {
                setError(message);
                setLoading(false);
            })
        }
    }, [query]);

    useEffect(() => {
        initData();
    }, []);
    
    return (
        <div className="App">
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Movie Database
                        </Typography>
                    </Toolbar>
                </AppBar>
            </Box>
            <Container style={{ padding: '24px', minHeight: 50 }}>
                <SearchBox searchHandler={searchHandler} />
            </Container>
            <Container style={{ padding: '12px', minHeight: 280 }}>
                    <Grid
                        container
                        spacing={2}
                        justifyContent="space-around"
                        alignItems="stretch"
                        direction="row"
                        >
                            { loading &&
                                <Loader />
                            }

                            { error !== null &&
                                <div style={{margin: '20px 0'}}>
                                    <Alert severity="error">{error}</Alert>
                                </div>
                            }
                            
                            { data !== null && data.length > 0 && data.map((result, index) => (
                                <ColCardBox 
                                    ShowDetail={setShowDetail} 
                                    DetailRequest={setDetailRequest}
                                    ActivateModal={setActivateModal}
                                    key={index} 
                                    {...result} 
                                />
                            ))}
                    </Grid>
                    <Dialog
                        onClose={() => setActivateModal(false)}
                        aria-labelledby="customized-dialog-title"
                        open={activateModal}
                        maxWidth='md'
                    >
                        <DialogTitle id="customized-dialog-title" onClose={() => setActivateModal(false)}>
                            Detail
                        </DialogTitle>
                        <DialogContent dividers>
                            { detailRequest === false ?
                                (<MovieDetail {...detail} />) :
                                (<Loader />) 
                            }
                        </DialogContent>
                    </Dialog>
            </Container>
            <Box py={1} textAlign={{ xs: 'center', md: 'right' }}>
              <Typography
                variant="body2"
                color="textSecondary"
              >
                ©rhld16 2022 All rights reserved
              </Typography>
            </Box>
        </div>
    );
}

export default App;
