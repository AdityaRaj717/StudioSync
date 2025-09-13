interface CallControlsProps {
  clients: string[];
  myId: string;
  callUser: (targetSocketId: string) => void;
}

const CallControls: React.FC<CallControlsProps> = ({
  clients,
  myId,
  callUser,
}) => {
  return (
    <ul>
      {clients
        .filter((client) => client !== myId)
        .map((client) => (
          <li key={client}>
            {client}{" "}
            <button className="border-2 p-2" onClick={() => callUser(client)}>
              Call
            </button>
          </li>
        ))}
    </ul>
  );
};

export default CallControls;
