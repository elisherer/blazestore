const FirestoreIcon = ({ size }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 192 192"
  >
    <g fill="none">
      <path d="M0 0h192v192H0z" />
      <path
        d="M96 104l-72 32v-32l72-32 72 32v28-6 10zm0-88l72 32v32L96 48 24 80V48zm27 116l36 16-63 28v-32z"
        fill="currentcolor"
        fillRule="evenodd"
      />
    </g>
  </svg>
);

export default FirestoreIcon;
