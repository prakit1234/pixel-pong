// pages/index.tsx

import { NextPage } from 'next';
import Head from 'next/head';
import Pong from '../components/pong';
import styles from '../styles/home.module.css';

const Home: NextPage = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>Pixel Pong</title>
                <meta name="description" content="Play the Pixel Pong game" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Pixel Pong</h1>
                <p className={styles.description}>
                    Enjoy a classic game of Pong, reimagined with pixel style!
                </p>
                
                {/* Game canvas */}
                <div className={styles.canvas}>
                    <Pong />
                </div>
            </main>
        </div>
    );
};

export default Home;
