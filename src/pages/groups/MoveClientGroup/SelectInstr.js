import { useParams } from 'react-router';

const SelectInstr = () => {
    const params = useParams();
    const tgt_id = params.tgt_id;
    console.log(tgt_id);
};

export default SelectInstr;
