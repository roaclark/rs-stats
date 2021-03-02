import styled from "styled-components";

const Header = styled.th`
  padding: 2px 20px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #ccc;
  font-size: 20px;
  font-weight: lighter;
`;

const Cell = styled.td`
  padding: 3px 20px;
`;

const TableBody = styled.tbody`
  tr:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const Table = ({
  data,
  header,
  rowStyles = () => ({}),
  cellStyles = () => ({}),
}) => {
  return (
    <table>
      {header && (
        <thead>
          <tr>
            {header.map((d, i) => (
              <Header key={i}>{d}</Header>
            ))}
          </tr>
        </thead>
      )}
      <TableBody>
        {data.map((row, ri) => (
          <tr key={ri} style={rowStyles(row, ri)}>
            {row.map((val, ci) => (
              <Cell key={ci} style={cellStyles(val, ci, row, ri)}>
                {val}
              </Cell>
            ))}
          </tr>
        ))}
      </TableBody>
    </table>
  );
};

export default Table;
