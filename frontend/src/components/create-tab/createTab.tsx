import { Button, Checkbox, FormControl, Grid, ImagePicker, Input, Label, Radio, TextArea } from '@edifice-ui/react'
import React from 'react'
import "./createTab.scss";


import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import ViewQuiltOutlinedIcon from '@mui/icons-material/ViewQuiltOutlined';
import ViewStreamOutlinedIcon from '@mui/icons-material/ViewStreamOutlined';

import myImage from './collaborativeeditor-default.png';

export default function createTab() {
    return (
        <div>
            <h4>Créer un tableau</h4>
            <Grid>
                <Grid.Col
                    sm="2"
                    style={{
                        minHeight: "70rem",
                        padding: ".8rem",
                    }}
                >
                    <ImagePicker
                        addButtonLabel="Add image"
                        deleteButtonLabel="Delete image"
                        label="Upload an image"
                        onDeleteImage={function Ga() { }}
                        onUploadImage={function Ga() { }}
                        src={myImage}
                    />
                    <div className='font-red'>
                        Veuillez choisir une image *
                    </div>
                </Grid.Col>
                <Grid.Col
                    sm="10"
                    style={{
                        minHeight: "10rem",
                        padding: ".8rem",
                    }}
                >
                    <div>
                        <div>
                            <FormControl id="title" className='space05'>
                                <Label>
                                    Titre de mon tableau *:
                                </Label>
                                <Input
                                    placeholder=""
                                    size="md"
                                    type="text"
                                />
                            </FormControl>
                            <FormControl id="description" className='space1half'>
                                <Label>
                                    Description:
                                </Label>
                                <TextArea
                                    size="md"
                                />
                            </FormControl>
                        </div>
                        <div className='space1half'>
                            <h5 className='space1'>Options du tableau</h5>
                            <Checkbox
                                label="Permettre aux utilisateurs de commenter les aimants"
                                onChange={function Ga() { }}
                            />
                            <Checkbox
                                label="Afficher le nombre de favoris sur les aimants"
                                onChange={function Ga() { }}
                            />
                        </div>
                        <div>
                            <h5>Quelle disposition des aimants souhaitez-vous?</h5>
                            <div className="d-flex gap-16 align-items-center">
                                <div className="d-flex gap-16 align-items-center">
                                    <Radio
                                        label="Libre"
                                        model="list"
                                        onChange={function Ga() { }}
                                        value="free"
                                    />
                                    <ViewQuiltOutlinedIcon sx={{ fontSize: 60 }} />
                                </div>
                                <div className="d-flex gap-16 align-items-center">
                                    <Radio
                                        label="Section verticale"
                                        model="list"
                                        onChange={function Ga() { }}
                                        value="vert"
                                    />
                                    <ViewColumnOutlinedIcon sx={{ fontSize: 60 }} />
                                </div>
                                <div className="d-flex gap-16 align-items-center">
                                    <Radio
                                        label="Section horizontale"
                                        model="list"
                                        onChange={function Ga() { }}
                                        value="hor"
                                    />
                                    <ViewStreamOutlinedIcon sx={{ fontSize: 60 }} />
                                </div>

                            </div>
                        </div>
                        <div className='space1'>
                            <FormControl id="keywords">
                                <Label>
                                    Mots-clés :
                                </Label>
                                <Input
                                    placeholder=""
                                    size="md"
                                    type="text"
                                />
                            </FormControl>
                        </div>
                        <div>
                            <div>
                                Image d'arrière plan du tableau :
                            </div>
                            <ImagePicker
                                addButtonLabel="Add image"
                                deleteButtonLabel="Delete image"
                                label="Upload an image"
                                onDeleteImage={function Ga() { }}
                                onUploadImage={function Ga() { }}
                                src={myImage}
                            />
                            <i className='font-little'>Pour un rendu optimal, nous conseillons de charger une image de minimum 1024x768px, format paysage.</i>
                        </div>
                    </div>
                    <div>
                        <div className="but">
                            <Button
                                color="primary"
                                type="button"
                                variant="outline"
                                className='ml-8'
                            >
                                Annuler
                            </Button>
                            <Button
                                color="primary"
                                type="submit"
                                variant="filled"
                                className='ml-8'
                            >
                                Enregistrer
                            </Button>
                        </div>
                    </div>
                </Grid.Col>
            </Grid>
        </div>
    )
}
