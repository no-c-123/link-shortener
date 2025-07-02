import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const Section = ({ section, setActiveSection, timeOfLastClick }) => {
    const { id, heading, paragraph } = section;

    const { ref, entry } = useInView({ threshold: 0.7 });

    useEffect(() => {
        if (entry && Date.now() - timeOfLastClick > 1000) {
            setActiveSection(entry.target.id);
        }
    }, [entry, setActiveSection, timeOfLastClick]);

    return (
        <section
            id={id}
            ref={ref}
            className="h-[95vh] flex flex-col justify-center items-center text-center"
        >
            <h1 className="text-7xl font-bold mb-6">{heading}</h1>
            <p className="text-lg font-medium max-w-md">{paragraph}</p>
        </section>
    );
};

export default Section;