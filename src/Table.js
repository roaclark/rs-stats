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

const Table = ({ data, header }) => {
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
        {data.map((row, i) => (
          <tr key={i}>
            {row.map((val, i) => (
              <Cell key={i}>{val}</Cell>
            ))}
          </tr>
        ))}
      </TableBody>
    </table>
  );
};

export default Table;
