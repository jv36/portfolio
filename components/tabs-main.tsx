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
                    <CardContent className="text-sm text-muted-foreground flex flex-col gap-2 items-start">
                        <div className="flex gap-2">
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
                        </div>
                        <Button variant="outline">
                            <a
                                href="https://linkedin.com/in/joaovicente36"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                            >
                                <svg
                                    role="img"
                                    viewBox="0 0 24 24"
                                    className="size-4 fill-current"
                                    aria-label="LinkedIn"
                                >
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                                joaovicente36
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
