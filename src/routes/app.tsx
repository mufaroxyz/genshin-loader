import { ErrorBoundary } from "react-error-boundary";
import LoadingScreen from "../components/core/loading-screen";
import useApplicationStore from "../components/state/application-state";
import { Button } from "../components/ui/button";
import { Clock, Download, Play, SettingsIcon } from "lucide-react";
import RoutePage from "../components/core/wrappers/route-page";
import LatestAnnouncementsGroup from "../components/core/game-announcements/latest-announcements-group";
import { motion } from "framer-motion";
import AutoDetectedPathModal from "../components/core/installation/auto-detected-path.modal";
import { useState } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import { tauriInvoke } from "../lib/utils";
import { TauriRoutes } from "../lib/ptypes";
import FreshInstallModal from "../components/core/installation/fresh-install.modal";
import { InstallationScreen } from "../components/core/installation/installation-screen";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: 60 },
  show: { y: 0 },
};

function getHoursAndMinutesFromSeconds(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return { hours, minutes };
}

function App() {
  const [currentModal, setCurrentModal] = useState<string | null>(null);

  const {
    applicationSettings,
    localGameManifest,
    installationContext,
    images,
  } = useApplicationStore();

  const applicationData = {
    applicationSettings,
    localGameManifest,
    images,
  };

  async function installGame() {
    const isWorthDetecting = await tauriInvoke(TauriRoutes.FindInstallationPath)
      .then((_) => true)
      .catch((_) => false);

    if (isWorthDetecting) {
      setCurrentModal("auto-detected-path");
      return;
    }

    setCurrentModal("fresh-install");
  }

  async function startGame() {
    if (applicationData.applicationSettings.genshinImpactData.path) {
      await invoke("start_game", {
        path: applicationData.applicationSettings.genshinImpactData.path,
      });
      return;
    } else {
      console.error("No path detected.");
    }
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="w-full h-full grid place-items-center">
          <div className="flex flex-col items-center">
            <img src="/qiqi_fallen.png" alt="Error" className="w-1/4 h-1/4" />
            <h2>Something went wrong.</h2>
            <p>Check the console for more details.</p>
          </div>
        </div>
      }
    >
      <LoadingScreen />
      <AutoDetectedPathModal
        open={currentModal === "auto-detected-path"}
        onOpenChange={(open) => {
          if (!open) {
            setCurrentModal(null);
          }
        }}
        setCurrentModal={setCurrentModal}
      />
      <FreshInstallModal
        open={currentModal === "fresh-install"}
        onOpenChange={(open) => {
          if (!open) {
            setCurrentModal(null);
          }
        }}
        setCurrentModal={setCurrentModal}
      />

      <RoutePage
        backgroundImage={convertFileSrc(applicationData.images.adv.background)}
        className="flex-row"
      >
        <InstallationScreen
          loadingStates={[
            {
              text: "Starting installation process",
            },
            {
              text: "Fetching game resources",
            },
            {
              text: "Calculating disk space",
            },
            {
              text: "Downloading game files",
            },
            {
              text: "Unpacking game files",
            },
            {
              text: "Finalizing installation",
            },
          ]}
          loading={installationContext.isInstalling}
        />
        <div className="flex-1 flex flex-col">
          <LatestAnnouncementsGroup />
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={"p-4 flex gap-2 self-end"}
        >
          <motion.div variants={item}>
            <Button
              variant="dark"
              label="Greet"
              className={"!w-fit"}
              acrylic
              icon={<Clock size={20} />}
            >
              {
                getHoursAndMinutesFromSeconds(
                  applicationData.applicationSettings.playTime
                ).hours
              }
              h{" "}
              {
                getHoursAndMinutesFromSeconds(
                  applicationData.applicationSettings.playTime
                ).minutes
              }
              m
            </Button>
          </motion.div>

          <motion.div variants={item}>
            <Button
              variant="dark"
              label="Greet"
              className={"!w-fit"}
              acrylic
              icon={<SettingsIcon size={20} />}
            >
              Configure
            </Button>
          </motion.div>
          <motion.div variants={item}>
            <Button
              onClick={() => {
                applicationData.applicationSettings.genshinImpactData.path
                  ? startGame()
                  : installGame();
              }}
              variant="accent"
              label="Greet"
              icon={
                applicationData.applicationSettings.genshinImpactData.path ? (
                  <Play size={20} />
                ) : (
                  <Download size={20} />
                )
              }
              className={"!w-fit"}
            >
              {applicationData.applicationSettings.genshinImpactData.path
                ? "Launch"
                : "Install Game"}
            </Button>
          </motion.div>
        </motion.div>
      </RoutePage>
    </ErrorBoundary>
  );
}

export default App;
