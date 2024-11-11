import Head from 'next/head';
import Pong from '../components/Pong'; // Ensure this path is correct
import styles from '../styles/Home.module.css'; // Ensure this path is correct

const Home: React.FC = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>Pong Game</title>
                <meta name="description" content="A simple Pong game built with Next.js" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <h1 className={styles.title}>Pong Game</h1>
                <Pong />
            </main>
        </div>
    );
};

export default Home;