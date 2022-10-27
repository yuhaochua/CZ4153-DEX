const DropDownOption= ({ pair }) => {

    return (
        <option value={pair.address}>{pair.name}</option>
    );
};

export default DropDownOption;