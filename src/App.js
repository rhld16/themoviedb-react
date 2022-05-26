import React, { useEffect, useState } from 'react';
import { 
    Row, 
    Col, 
    Card, 
    Tag, 
    Spin, 
    Modal,
    Alert
} from 'antd';
import 'antd/dist/antd.css';
import { 
    AppBar, 
    Box, 
    CardActionArea, 
    CardContent, 
    CardMedia, 
    Chip, 
    Container, 
    Grid, 
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
                        image={poster_path === null ? 'https://placehold.it/300x450&text=Image+Not+Found' : "https://image.tmdb.org/t/p/w300" + poster_path}
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
        // <Grid container spacing={2} columns={16}>
        //     <Grid item xs={8}>
        //         <img src={poster_path === null ? 'https://placehold.it/300x450&text=Image+Not+Found' : "https://image.tmdb.org/t/p/w300" + poster_path} alt={title} style={{width: '100%'}} />
        //     </Grid>
        //     <Grid item xs={8}>
        //         {/* movie title with score on right side */}
        //         <Typography variant="h5" gutterBottom>
        //             {title}
        //             <Chip label={vote_average} size="small" style={{marginLeft: '10px'}} />
        //         </Typography>
        //     </Grid>
        // </Grid>
        <Row>
            <Col span={11}>
                <img 
                    src={poster_path === 'N/A' ? 'https://placehold.it/198x264&text=Image+Not+Found' : "https://image.tmdb.org/t/p/w300" + poster_path} 
                    alt={title} 
                />
            </Col>
            <Col span={13}>
                <Row>
                    <Col span={21}>
                        <Typography variant="h5" component="h2">
                            {title}
                        </Typography>
                    </Col>
                    <Col span={3} style={{textAlign:'right'}}>
                        <Typography gutterBottom variant="h5" component="h2">
                            {vote_average}
                        </Typography>
                    </Col>
                </Row>
                <Row style={{marginBottom: '20px'}}>
                    <Col>
                        <Tag>{runtime}</Tag> 
                        <Tag>{genres}</Tag>
                    </Col>
                </Row>
                <Row>
                    <Col>{overview}</Col>
                </Row>
            </Col>
        </Row>
    )
}

const Loader = () => (
    <div style={{margin: '20px 0', textAlign: 'center'}}>
        <Spin />
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
            <Container style={{ padding: '24px', minHeight: 280 }}>
                    <SearchBox searchHandler={searchHandler} />

                    <Grid container>
                            { loading &&
                                <Loader />
                            }

                            { error !== null &&
                                <div style={{margin: '20px 0'}}>
                                    <Alert message={error} type="error" />
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
                    <Modal
                        title='Detail'
                        centered
                        visible={activateModal}
                        onCancel={() => setActivateModal(false)}
                        footer={null}
                        width={800}
                        >
                        { detailRequest === false ?
                            (<MovieDetail {...detail} />) :
                            (<Loader />) 
                        }
                    </Modal>
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
