const About = () => {
    return (
        <section id="about" className="h-screen flex flex-col justify-center items-center text-center bg-gray-900 text-white px-4">
            <h2 className="text-5xl md:text-7xl font-bold mb-6">About SnapLink</h2>
            <p className="text-lg md:text-2xl mb-8 max-w-2xl">
                SnapLink is a fast and modern link shortener designed to help you share links instantly with a sleek and simple interface.
            </p>
            <p className="text-md max-w-xl text-gray-400">
                Whether you're managing personal links or tracking shared content, SnapLink offers a smooth, reliable experience. No clutter. Just clean, professional link sharing.
            </p>
        </section>
    );
};

export default About;