export const articles = [
  {
    id: "assembly-in-the-browser",
    title: "Making the invisible machine visible.",
    description:
      "What changes when assembly becomes something you can inspect, step through, and play with?",
    readTime: "5 MIN",
    projectIds: ["asmbook", "doomsday-algorithm-in-assembly-language"],
    sections: [
      {
        heading: "Start with a state, not a wall of instructions.",
        body: "Assembly describes small, precise changes to a machine. That precision can be difficult to see when the program is presented as a static text file. A register changes, a flag is set, execution branches—and the reader has to hold those changes in their head.\n\nASMBOOK and the assembly dry-running experiments approach that gap through an interface: put code near the state it changes. The browser becomes a place to inspect and experiment, while the original program remains the subject.",
      },
      {
        heading: "The browser is a delivery mechanism.",
        body: "A visitor should not need to install a toolchain just to understand the idea behind a project. Browser emulation can remove that first barrier. The Doomsday assembly project uses a DOSBox/WebAssembly environment to bring handwritten NASM into a web page.\n\nThis does not turn assembly into JavaScript or make the emulator a replacement for every development workflow. It makes an existing program available in a familiar place, with a link back to the source for deeper investigation.",
      },
      {
        heading: "A small mathematical program is a useful exhibit.",
        body: "Conway’s Doomsday method determines the weekday of a date using calendar anchors and arithmetic. It has a concrete input, a recognizable output, and intermediate steps that can be explained. That makes it a useful way to connect a mathematical procedure with a low-level implementation.\n\nThe exhibit has two jobs: let someone try the calculation, and make it possible to see the machinery behind it. A result alone answers the date question. Inspectable execution answers the more interesting programming question: how did the machine get there?",
      },
      {
        heading: "A good demo keeps its boundaries visible.",
        body: "An educational emulator has its own supported instructions, input rules, and operating assumptions. Presenting those limits alongside the application helps visitors understand what they are testing. Screenshots can introduce the project, but the original running application is the useful next step.\n\nThat distinction also shaped this portfolio. The preview loads the actual deployed application when you choose to interact. The surrounding presentation explains it; it does not reimplement or pretend to execute it.",
      },
    ],
  },
  {
    id: "algorithms-as-experiences",
    title: "An algorithm is a story of small decisions.",
    description:
      "Designing visual explanations around intermediate states, useful controls, and honest limitations.",
    readTime: "4 MIN",
    projectIds: [
      "algorithms-visualizer",
      "visualizers",
      "top-10-nlp-algorithms-simulators",
    ],
    sections: [
      {
        heading: "The answer hides the explanation.",
        body: "A sorted list looks the same regardless of how it was sorted. The interesting differences are in the path: comparisons, swaps, partitions, visits, and intermediate structures. AlgoViz presents that path as an experience visitors can follow.\n\nFor a visual explanation, the smallest useful unit is often a meaningful algorithm event rather than an animation frame. Separating the algorithm’s state from the presentation makes it easier to reason about both.",
      },
      {
        heading: "Give the viewer control over time.",
        body: "A polished animation can still move too quickly to teach anything. Playback controls allow a visitor to stop, inspect, and continue. A slow step through an unfamiliar operation is often more useful than watching a complete run at full speed.\n\nThe interface should make the current operation legible. Which items are being compared? Which region is settled? What changes next? Color can reinforce these relationships, but labels and structure should carry the meaning too.",
      },
      {
        heading: "Reference playback and live computation are different.",
        body: "The hosted NLP Reference Lab contains precomputed reference runs. They are valuable for explaining known examples, but they do not execute a fresh simulation for arbitrary user input. That distinction belongs in the interface.\n\nThe same principle applies across the collection: a conceptual transformer visualization explains relationships and operations, while a trained model requires separate evidence about data, evaluation, and behavior. One should not quietly stand in for the other.",
      },
      {
        heading: "Visual speed is not algorithmic performance.",
        body: "Animation duration depends on rendering, chosen delays, the device, and the interface. It is not a reliable measure of computational complexity. A visualizer can help build intuition about an algorithm’s operations, but performance claims need controlled measurements.\n\nThese projects are invitations to experiment. Change a starting condition, observe the sequence, and compare it with the source. The most useful result is a better question about what the algorithm is doing.",
      },
    ],
  },
  {
    id: "tools-for-coding-agents",
    title: "Small tools. Clear boundaries. Better agents.",
    description:
      "Notes on organizing agent workflows around focused commands, persistent context, and inspectable results.",
    readTime: "5 MIN",
    projectIds: [
      "kaggle-run-skill",
      "agentic-ai-megaproject-template",
      "ai-stack",
    ],
    sections: [
      {
        heading: "Keep the current task small enough to inspect.",
        body: "Agent workflows can accumulate context quickly. Installation instructions, API references, earlier decisions, and unrelated implementation details all compete for attention. The kaggle-run-skill repository uses a compact entry point with purpose-specific scripts, so the current operation can stay focused.\n\nThe goal is not to hide complexity. It is to put the relevant complexity behind a clear command and leave the evidence of what happened available for inspection.",
      },
      {
        heading: "A command should have a concrete outcome.",
        body: "Deploying a notebook, checking a run, and preparing a competition submission are different operations. Each has its own inputs, prerequisites, and results. Separating them makes failures easier to locate and instructions easier to reuse.\n\nCredentials and account actions remain explicit parts of the user’s workflow. A portfolio can explain the tool and link its installation instructions without attempting a real Kaggle operation for every visitor.",
      },
      {
        heading: "Memory works best when it is maintained.",
        body: "The agentic project template documents phase gates, state-file memory, traceability, work packets, and review decisions. These are mechanisms for making a larger project understandable across sessions.\n\nA short current map of the system can be more useful than repeatedly reading an entire repository. In this portfolio, the shared catalog, rendering surfaces, preview lifecycle, and AI endpoint are documented separately. Graphify supplies structural relationships; the architecture notes explain the decisions those relationships cannot capture.",
      },
      {
        heading: "Inspect the result, not just the response.",
        body: "An agent saying a change is complete is not the same as a deployed page loading correctly. The workflow needs evidence appropriate to the task: build output, meaningful tests, source checks, or browser interaction.\n\nFor an interactive site, that includes the awkward moments: a sleeping demo server, a blocked iframe, an unavailable model, a small screen, or reduced motion. Good boundaries give those situations useful behavior instead of allowing them to break the whole experience.",
      },
    ],
  },
];
