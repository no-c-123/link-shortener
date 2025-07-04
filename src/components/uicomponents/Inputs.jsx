const Input = ({ type = 'text', value, onChange, placeholder, label }) => {
    return (
        <div className="w-full flex justify-center">
            <div className="relative w-full max-w-xs">
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required
                    className="peer w-full bg-transparent border-b-2 border-gray-500 text-white placeholder-transparent focus:outline-none focus:border-purple-500 px-2 py-3 transition-all"
                />
                <label
                    className="absolute left-2 top-3 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-[-10px] peer-focus:left-[-1px] peer-focus:text-sm peer-focus:text-purple-500"
                >
                    {label}
                </label>
            </div>
        </div>
    );
};

export default Input;