import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import QUERY_PARAMS from 'utils/constants/query-params';
import {DOMAIN_API} from 'config/api-backend';
import BackButton from 'components/BackButton';
const Watch = () => {
    const { query } = useRouter();
    const movieId = query[QUERY_PARAMS.MOVIE];
    const router = useRouter();
    const [movieData, setMovieData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEpisode, setSelectedEpisode] = useState(null);
    const [selectedServerId, setSelectedServerId] = useState(null);
    const [availableServers, setAvailableServers] = useState([]);
    const [episodes, setEpisodes] = useState([]);
    const [isMultiEpisode, setIsMultiEpisode] = useState(false);

    useEffect(() => {
        if (!movieId) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${DOMAIN_API}/api/episode/${movieId}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                if (result.status === 200 && result.data?.episodes?.length > 0) {
                    const servers = result.data.episodes;
                    const allEpisodes = Array.from(new Set(servers.flatMap(server => server.episode.map(ep => ep.episode))));
                    
                    setMovieData({
                        title: result.data.title,
                        servers,
                    });
                    setAvailableServers(servers);
                    setEpisodes(allEpisodes);
                    setIsMultiEpisode(result.data.type === 1);
                    
                    setSelectedEpisode(allEpisodes[0]);
                    setSelectedServerId(servers[0].server_id);
                    document.title = result.data.type === 1 ? `${result.data.title} - Tập ${allEpisodes[0]}` : result.data.title;
                } else {
                    throw new Error('Invalid API response');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [movieId]);

    const getEpisodeLink = () => {
        const currentServer = availableServers.find(server => server.server_id === selectedServerId);
        return currentServer?.episode.find(ep => ep.episode === selectedEpisode)?.linkphim || '';
    };

    const iframeSrc = getEpisodeLink() ? `https://nestphim.site/hls?link=${getEpisodeLink()}` : '';

    const handleEpisodeChange = (episode) => {
        setSelectedEpisode(episode);
        document.title = isMultiEpisode ? `${movieData.title} - Tập ${episode}` : movieData.title;
    };

    const handleServerChange = (serverId) => {
        setSelectedServerId(serverId);
        const currentServer = availableServers.find(server => server.server_id === serverId);
        const episodeExists = currentServer?.episode.some(ep => ep.episode === selectedEpisode);
        if (!episodeExists) {
            setSelectedEpisode(currentServer?.episode[0]?.episode || selectedEpisode);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'black' }}>
            {loading && <p style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>Loading...</p>}
            {error && <p style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>Error: {error}</p>}
            <button
                onClick={() => router.back()}  // Quay lại trang trước đó
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: '#444',
                    color: '#fff',
                    padding: '15px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    zIndex: 1000,
                }}
                
            >
                Back
            </button>
            {!loading && !error && movieData && (
                <>
                    <div id="videoFrameContainer" style={{ flexGrow: 1, position: 'relative' }}>
                        <iframe
                            src={iframeSrc}
                            title={movieData.title}
                            allowFullScreen
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none',
                            }}
                        ></iframe>
                    </div>

                    <div style={{ padding: '10px', backgroundColor: '#111', color: '#fff', overflowY: 'auto', maxHeight: '200px', marginTop: '20px' }}>
                        <h2>Chọn Server</h2>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '10px' }}>
                            {availableServers.map((server) => (
                                <li
                                    key={server.server_id}
                                    style={{
                                        padding: '10px',
                                        backgroundColor: selectedServerId === server.server_id ? '#444' : '#222',
                                        cursor: 'pointer',
                                        borderRadius: '5px',
                                        transition: 'background-color 0.3s ease',
                                    }}
                                    onClick={() => handleServerChange(server.server_id)}
                                >
                                    Server {server.server_id}
                                </li>
                            ))}
                        </ul>

                        {isMultiEpisode ? (
                            <>
                                <h3>Chọn Tập</h3>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {episodes.map((episode) => (
                                        <li
                                            key={episode}
                                            style={{
                                                padding: '10px',
                                                backgroundColor: selectedEpisode === episode ? '#444' : '#222',
                                                cursor: 'pointer',
                                                borderRadius: '5px',
                                                transition: 'background-color 0.3s ease',
                                            }}
                                            onClick={() => handleEpisodeChange(episode)}
                                        >
                                            Episode {episode}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : null}
                    </div>
                </>
            )}
        </div>
    );
};

export default Watch;
