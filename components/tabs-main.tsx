import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "./ui/button"
import { siGithub, siGmail } from "simple-icons"

export function TabsMain() {
    return (
        <Tabs defaultValue="overview" className="w-[400px]">
            <TabsList>
                <TabsTrigger value="about">About me</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="resume">Resumé</TabsTrigger>
                <TabsTrigger value="contact">Contact me</TabsTrigger>
            </TabsList>
            <TabsContent value="about">
                <Card>
                    <CardHeader>
                        <CardTitle>About me</CardTitle>
                        <CardDescription>
                            I am a software developer with focus on web development. I graduated in Informatics & Computing Engineering at FEUP and I am currently pursuing my Master's Degree in Software Engineering at FEUP.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        I am a sports and music nerd.
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="projects">
                <Card>
                    <CardHeader>
                        <CardTitle>Projects</CardTitle>
                        <CardDescription>
                            These are some of my favorite projects, although you can find everything on my GitHub profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground gap-2 flex">
                        <Button variant="outline">
                            <a
                                href="https://linkingpark.joaovicente.dev"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                LinkingPark
                            </a>
                        </Button>
                        <Button variant="outline">
                            <a
                                href="https://jv36.github.io/buzz_controller"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Buzz Controller
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="resume">
                <Card>
                    <CardHeader>
                        <CardTitle>Resumé</CardTitle>
                        <CardDescription>
                            You can download my resumé in PDF format by clicking the button below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <Button variant="outline">
                            <a
                                href="/CV_JoaoVicente.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Download
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="contact">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact me</CardTitle>
                        <CardDescription>
                            Interested in working with me? You can contact me through multiple ways.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground gap-2 flex">
                        <Button variant="outline">
                            <a
                                href="https://github.com/jv36"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                            >
                                <svg
                                    role="img"
                                    viewBox="0 0 24 24"
                                    className="size-4 fill-current"
                                    aria-label={siGithub.title}
                                >
                                    <path d={siGithub.path} />
                                </svg>
                                jv36
                            </a>
                        </Button>
                        <Button variant="outline">
                            <a
                                href="mailto:hi@joaovicente.dev"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                            >
                                <svg
                                    role="img"
                                    viewBox="0 0 24 24"
                                    className="size-4 fill-current"
                                    aria-label={siGmail.title}
                                >
                                    <path d={siGmail.path} />
                                </svg>
                                hi@joaovicente.dev
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
