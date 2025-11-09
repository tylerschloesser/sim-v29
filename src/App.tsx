import { times } from "lodash-es";

export function App() {
  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <div className="fixed inset-0 top-[unset]">
        <div className="p-4">
          <div className="border rounded flex">
            {times(5, (i) => (
              <button key={i} className="flex-1 p-2 aspect-square">
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
